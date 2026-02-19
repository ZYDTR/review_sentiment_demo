# Notion 页面导出到本地

将 [AI-architect](https://www.notion.so/AI-architect-2bd93eff38a080ffa63dfa72cb0a9ed9) 页面的内容及配置导出到本地。

## 方式一：Notion API（推荐，无需 file_token）

如果你找不到 `file_token`，用这种方式更简单：

1. 打开 [notion.so/my-integrations](https://www.notion.so/my-integrations) 创建 Integration
2. 复制 **Internal Integration Secret**
3. 打开 AI-architect 页面 → 右上角 **•••** → **Connections** → 添加该 Integration
4. 在 `.env` 中设置：`NOTION_API_KEY=你的secret`
5. 运行：`npm run export:api`

---

## 方式二：Cookie 导出（需要 token_v2 + file_token）

### 1. 获取 Cookie

1. 打开 [notion.so](https://www.notion.so) 并登录
2. 按 `F12` 打开开发者工具
3. 进入 **Application** → **Storage** → **Cookies** → `https://www.notion.so`
4. 找到 `token_v2` 和 `file_token`，复制它们的 **Value**

**找不到 file_token？**
- 在 Cookie 列表上方的搜索框输入 `file` 筛选
- 向下滚动，有时在列表靠下位置
- 尝试打开一个带图片的页面后再刷新 Cookie 列表
- 若始终没有，建议改用上面的 **方式一（Notion API）**

### 2. 配置

```bash
cd notion_export
cp .env.example .env
# 编辑 .env，填入 token_v2 和 file_token
```

### 3. 安装依赖并导出

```bash
npm install
npm run export          # 导出 Markdown
npm run export:full     # 完整导出（含图片、子页面等）
```

导出文件会保存在 `output/` 目录。

## 导出内容说明

| 命令 | 输出 |
|------|------|
| `npm run export` | `AI-architect.md`（Markdown），如为数据库则额外有 CSV |
| `npm run export:full` | 完整 ZIP 解压内容到 `output/`，包含图片、附件、子页面 |

## 其他导出方式

### 方式一：Notion 内置导出（无需脚本）

1. 打开目标 Notion 页面
2. 点击右上角 `•••` → **Export**
3. 选择格式：**Markdown & CSV** 或 **HTML**
4. 点击 **Export** 下载

### 方式二：Notion API（适合自动化）

如需通过 Notion 官方 API 获取结构化数据，需：

1. 在 [Notion 开发者设置](https://www.notion.so/my-integrations) 创建 Integration
2. 在目标页面点击 **•••** → **Connections** → 添加该 Integration
3. 使用 `@notionhq/client` 调用 API 读取 blocks

## 注意事项

- Cookie 会过期，若导出失败可重新获取
- 私密内容需确保已登录对应账号
- `notion-exporter` 依赖 Notion 内部导出接口，未来可能变动
