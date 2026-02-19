#!/usr/bin/env node
/**
 * 使用 Notion 官方 API 导出（无需 file_token！）
 *
 * 步骤：
 * 1. 打开 https://www.notion.so/my-integrations 创建 Integration
 * 2. 复制 Internal Integration Secret
 * 3. 打开你的 AI-architect 页面 → 右上角 ••• → Connections → 添加该 Integration
 * 4. 在 .env 中设置 NOTION_API_KEY=你的secret
 * 5. 运行: npm run export:api
 */

import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGE_ID = "2bd93eff38a080ffa63dfa72cb0a9ed9";
const OUTPUT_DIR = path.join(__dirname, "output");

function loadEnv() {
  const envPath = path.join(__dirname, ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

function blockToMarkdown(block) {
  const type = block.type;
  const content = block[type];
  if (!content) return "";

  const richText = content.rich_text || [];
  const text = richText.map((t) => t.plain_text).join("");

  switch (type) {
    case "paragraph":
      return text ? `${text}\n\n` : "";
    case "heading_1":
      return `# ${text}\n\n`;
    case "heading_2":
      return `## ${text}\n\n`;
    case "heading_3":
      return `### ${text}\n\n`;
    case "bulleted_list_item":
      return `- ${text}\n`;
    case "numbered_list_item":
      return `1. ${text}\n`;
    case "to_do":
      return `- [${content.checked ? "x" : " "}] ${text}\n`;
    case "toggle":
      return `**${text}**\n\n`;
    case "quote":
      return `> ${text}\n\n`;
    case "code":
      return `\`\`\`${content.language || ""}\n${text}\n\`\`\`\n\n`;
    case "divider":
      return "---\n\n";
    case "callout":
      const icon = content.icon?.emoji || "💡";
      return `> ${icon} ${text}\n\n`;
    default:
      return text ? `${text}\n\n` : "";
  }
}

async function fetchBlocks(client, blockId, mdLines = []) {
  let cursor = undefined;
  do {
    const { results, next_cursor } = await client.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const block of results) {
      mdLines.push(blockToMarkdown(block));
      if (block.has_children) {
        await fetchBlocks(client, block.id, mdLines);
      }
    }
    cursor = next_cursor;
  } while (cursor);
  return mdLines;
}

async function main() {
  loadEnv();
  const apiKey =
    process.env.NOTION_API_KEY ||
    process.env.NOTION_INTEGRATION_SECRET;

  if (!apiKey) {
    console.error(`
❌ 请配置 NOTION_API_KEY！

这种方式不需要 file_token，只需：

1. 打开 https://www.notion.so/my-integrations
2. 点击 "New integration" 创建
3. 复制 "Internal Integration Secret"
4. 打开 AI-architect 页面 → 右上角 ••• → Connections → 添加该 Integration
5. 在 .env 中添加：NOTION_API_KEY=你的secret
`);
    process.exit(1);
  }

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const client = new Client({ auth: apiKey });

  try {
    const page = await client.pages.retrieve({ page_id: PAGE_ID });
    const title =
      page.properties?.title?.title?.[0]?.plain_text ||
      page.properties?.Name?.title?.[0]?.plain_text ||
      "AI-architect";

    console.log(`📄 正在导出: ${title}\n`);

    const mdLines = await fetchBlocks(client, PAGE_ID);
    const md = `# ${title}\n\n` + mdLines.join("");
    const mdPath = path.join(OUTPUT_DIR, "AI-architect-api.md");
    fs.writeFileSync(mdPath, md, "utf-8");

    console.log(`✅ 已保存: ${mdPath}\n🎉 完成！`);
  } catch (err) {
    if (err.code === "object_not_found" || err.status === 404) {
      console.error(`
❌ 无法访问该页面。请确认：
1. 已在 AI-architect 页面点击 ••• → Connections → 添加你的 Integration
2. Integration Secret 正确无误
`);
    } else if (err.code === "unauthorized") {
      console.error("❌ API Key 无效，请检查 NOTION_API_KEY");
    } else {
      console.error("❌ 导出失败:", err.message);
    }
    process.exit(1);
  }
}

main();
