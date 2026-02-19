# RFC-001：评论自动化工作流技术方案（V1）

- 文档状态：Draft
- 最后更新：2026-02-19
- 作者：项目组
- 对应 PRD：`docs/prd_review_automation_demo.md`
- 关联文档：
  - `docs/api_facts_google_sheet_make_llm.md`
  - `docs/working_log.md`
  - `docs/lessons_playbook.md`

## 1. 摘要
本 RFC 定义一个可维护的自动化流程技术方案：  
Google Sheets 评论行 -> LLM 情感/摘要 -> 回写 -> 每周聚合 -> HTML 邮件发送。

## 2. 设计目标
1. 在短周期内完成高可演示性的端到端闭环。
2. AI 输出结构化且稳定，可校验可回退。
3. 处理流程具备幂等能力和可观测性。
4. 组件数量最小化，方便交接与维护。

## 3. 设计约束
1. 使用现有 Google Sheet 作为数据源。
2. 使用自动化平台（Make/Zapier 或等价实现）+ LLM API。
3. V1 架构优先简单、可调试、可解释。

## 4. 系统架构
```text
[Google Sheet: reviews]
        |
        v
[触发器: 定时轮询/新增行触发]
        |
        v
[预检查: 字段与输入校验]
        |
        v
[LLM: 情感+摘要]
        |
        v
[结果校验 + 一次纠错重试]
        |
        +----> [失败回写: status/error_reason]
        |
        v
[成功回写: sentiment/summary/metadata]

每周任务:
[按时间窗拉取数据] -> [聚合统计] -> [HTML格式化] -> [邮件发送]
```

## 5. 数据契约
### 输入列（必需）
1. `row_id`（或可稳定映射的唯一主键）
2. `created_at`
3. `review_text`

### 输出列
1. `sentiment`（`Positive|Neutral|Negative`）
2. `summary`（一句话摘要）
3. `status`（`SUCCESS|FAILED|SKIPPED_EMPTY_INPUT|SKIPPED_ALREADY_PROCESSED`）
4. `error_reason`
5. `processed_at`
6. `run_id`
7. `model_version`
8. `prompt_version`

## 6. 处理流程
1. 触发器取到候选评论行。
2. 校验必填列与 `review_text` 非空。
3. 执行幂等检查：
   - 已成功且未启用强制重跑 -> 直接跳过。
4. 构建严格输出 schema 的 prompt。
5. 调用 LLM。
6. 校验输出：
   - 情感值必须命中枚举。
   - 摘要非空且长度达标。
7. 若校验失败，执行一次纠错重试。
8. 回写结果：
   - 成功：写入结果与元数据。
   - 失败：写 `FAILED` 和可定位错误原因。

## 7. Prompt 设计策略
1. 指令采用结构化约束，返回 JSON：
   - `sentiment`
   - `summary`
2. 情感标签严格限定为 3 类枚举。
3. 摘要要求简洁、客观、不可臆测。
4. 每次回写记录 `prompt_version` 便于回归。

## 8. 失败与重试策略
1. 可重试错误：
   - API 超时
   - 临时 5xx
   - 短暂解析异常
2. 重试策略：
   - 最大重试次数 `2`
   - 指数退避（示例：2s、5s）
3. 不可重试错误：
   - 缺失必需列
   - 评论为空
   - 配置 schema 非法
4. 失败留痕：
   - 保留失败状态与错误原因
   - 支持人工触发重跑

## 9. 周报设计
1. 时间窗：
   - 支持配置时区与周起止规则。
2. 指标项：
   - 评论总数
   - 正向/中性/负向数量与占比
   - 一句总体趋势总结
3. 邮件格式：
   - 统一 HTML 模板
   - 包含数据窗口与生成时间

## 10. 可观测性
1. 行级观测：`status/error_reason/processed_at/run_id`。
2. 运行观测：执行过程写入 `docs/working_log.md`。
3. 决策观测：关键取舍沉淀至 `docs/lessons_playbook.md`。

## 11. 安全要求（V1）
1. API 密钥仅保存在环境变量或密钥管理器。
2. 文档和表格中禁止出现明文凭证。
3. 日志中最小化敏感信息。

## 12. 上线与演示计划
1. 第一步：30 条样本干跑验证。
2. 第二步：校验质量阈值与失败恢复路径。
3. 第三步：启用每周调度与邮件发送。
4. 第四步：完成演示脚本与交接包。

## 13. 待确认项
1. 自动化平台最终采用 Make、Zapier 还是轻量脚本。
2. 周报邮件收件人规模和名单维护方式。
3. 周报统计时间窗使用的最终时区。
