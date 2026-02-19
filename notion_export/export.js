#!/usr/bin/env node
/**
 * Notion 页面导出脚本
 * 将 https://www.notion.so/AI-architect-2bd93eff38a080ffa63dfa72cb0a9ed9 导出到本地
 *
 * 使用前请：
 * 1. 在浏览器登录 notion.so
 * 2. 打开开发者工具 (F12) -> Application -> Cookies -> notion.so
 * 3. 复制 token_v2 和 file_token 的值到 .env 文件
 */

import NotionExporter from "notion-exporter";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 页面 ID：从 URL https://www.notion.so/AI-architect-2bd93eff38a080ffa63dfa72cb0a9ed9 提取
const PAGE_ID = "2bd93eff38a080ffa63dfa72cb0a9ed9";
const OUTPUT_DIR = path.join(__dirname, "output");

// 支持从环境变量或 .env 文件读取
function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, "");
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  loadEnv();

  const tokenV2 = process.env.TOKEN_V2 || process.env.token_v2;
  const fileToken = process.env.FILE_TOKEN || process.env.file_token;

  if (!tokenV2 || !fileToken) {
    console.error(`
❌ 缺少认证信息！请在 notion_export/.env 中配置：

TOKEN_V2=你的token_v2值
FILE_TOKEN=你的file_token值

获取方法：
1. 打开 https://www.notion.so 并登录
2. 按 F12 打开开发者工具
3. 进入 Application → Storage → Cookies → https://www.notion.so
4. 找到 token_v2 和 file_token，复制它们的 Value
5. 粘贴到 .env 文件中
`);
    process.exit(1);
  }

  const fullExport = process.argv.includes("--full");

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log("🚀 开始导出 Notion 页面...\n");

  try {
    const exporter = new NotionExporter(tokenV2, fileToken);

    if (fullExport) {
      // 完整导出：获取 ZIP 并解压到 output
      console.log("📦 正在导出完整内容（含图片、子页面等）...");
      await exporter.getMdFiles(PAGE_ID, OUTPUT_DIR);
      console.log(`✅ 已导出到 ${OUTPUT_DIR}/\n`);
    } else {
      // Markdown 导出
      console.log("📄 正在导出 Markdown...");
      const md = await exporter.getMdString(PAGE_ID);
      const mdPath = path.join(OUTPUT_DIR, "AI-architect.md");
      fs.writeFileSync(mdPath, md, "utf-8");
      console.log(`✅ Markdown 已保存: ${mdPath}\n`);

      // 尝试导出 CSV（如果是 database 页面）
      try {
        const csv = await exporter.getCsvString(PAGE_ID);
        const csvPath = path.join(OUTPUT_DIR, "AI-architect.csv");
        fs.writeFileSync(csvPath, csv, "utf-8");
        console.log(`✅ CSV 已保存: ${csvPath}\n`);
      } catch (e) {
        // 不是数据库页面时跳过
      }
    }

    console.log("🎉 导出完成！");
  } catch (err) {
    console.error("❌ 导出失败:", err.message);
    if (err.message?.includes("401") || err.message?.includes("unauthorized")) {
      console.error("\n💡 提示：token 可能已过期，请重新从浏览器获取 token_v2 和 file_token");
    }
    process.exit(1);
  }
}

main();
