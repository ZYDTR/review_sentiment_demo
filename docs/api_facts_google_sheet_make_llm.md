# API Facts：Google Sheets + 自动化平台 + LLM（V1）

- 文档状态：Draft
- 最后更新：2026-02-19
- 目的：沉淀外部依赖的“已确认事实”和“待确认事项”，避免拍脑袋开发。
- 关联文档：
  - `docs/prd_review_automation_demo.md`
  - `docs/rfc_review_automation_v1.md`
  - `docs/working_log.md`

## 1. 依赖清单（V1）
1. Google Sheets（数据源 + 回写目标）
2. 自动化平台（Make/Zapier 或等价方案）
3. LLM API（情感分类 + 一句话摘要）
4. 邮件发送能力（平台内置或 SMTP/服务商）

## 2. Google Sheets 事实约束
### 2.1 必需输入列
1. `row_id`：唯一键（建议固定，不随排序变化）
2. `created_at`：评论创建时间
3. `review_text`：评论正文

### 2.2 必需输出列
1. `sentiment`
2. `summary`
3. `status`
4. `error_reason`
5. `processed_at`
6. `run_id`
7. `model_version`
8. `prompt_version`

### 2.3 表结构约束
1. 列名变更必须同步配置文件。
2. 新增列不应破坏既有读取逻辑。
3. 上线前必须执行一次列完整性检查。

## 3. 自动化平台能力要求
1. 支持定时任务或新增行触发。
2. 支持调用 HTTP API 并处理 JSON。
3. 支持条件分支与错误重试配置。
4. 支持写回 Google Sheets 指定行。
5. 支持发送 HTML 邮件。

## 4. LLM 接口要求
1. 输入：
   - `review_text`
   - prompt 模板（包含输出格式约束）
2. 输出（目标 JSON）：
   - `sentiment`：`Positive|Neutral|Negative`
   - `summary`：一句话摘要
3. 运行要求：
   - 失败可重试
   - 超时可配置
   - 模型版本可记录

## 5. 邮件输出要求
1. 必含信息：
   - 统计时间窗
   - 总评论数
   - 三类情感计数和占比
   - 一句话趋势总结
2. 样式要求：
   - 简洁 HTML
   - 手机和桌面可读

## 6. 错误码与状态建议
### 6.1 行级状态
1. `SUCCESS`
2. `FAILED`
3. `SKIPPED_EMPTY_INPUT`
4. `SKIPPED_ALREADY_PROCESSED`

### 6.2 典型错误原因（`error_reason`）
1. `MISSING_REQUIRED_COLUMN`
2. `EMPTY_REVIEW_TEXT`
3. `LLM_TIMEOUT`
4. `LLM_INVALID_OUTPUT`
5. `SHEET_WRITE_FAILED`
6. `EMAIL_SEND_FAILED`

## 7. 配置项清单（建议）
1. `timezone`
2. `weekly_window_start`
3. `sheet_id`
4. `sheet_tab_name`
5. `input_column_map`
6. `output_column_map`
7. `llm_model`
8. `prompt_version`
9. `retry_max`
10. `retry_backoff_seconds`
11. `email_recipients`

## 8. 待确认事实（上线前必须关闭）
1. 最终自动化平台选型。
2. LLM 服务商与模型名。
3. Google Sheet 真实列名是否与约定一致。
4. 周报收件人名单和权限归属。
5. 时区规则（是否统一 UTC 或业务时区）。
