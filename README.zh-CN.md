# RevisionFlow

[English](README.md) | [简体中文](README.zh-CN.md)

> 一个开源 MVP，用于将零散、重复或互相矛盾的客户反馈整理为可追溯的修改计划。

RevisionFlow 是面向创意与交付团队的单页工作台：补充项目背景、粘贴反馈或导入文件，再使用自己的 OpenRouter Key 生成严格结构化且可编辑的报告。

## 截图

### 工作台

![RevisionFlow 工作台](public/screenshots/workspace.png)

### 示例报告

![RevisionFlow 示例报告](public/screenshots/sample-report.png)

## 快速演示

1. 执行 `npm install` 和 `npm run dev`。
2. 打开 `http://localhost:3000`。
3. 点击 **Load sample project**，再点击 **Preview sample report**。
4. 浏览六个报告标签页，编辑一项修改任务，并在本地导出 CSV、Markdown 或 JSON。

示例报告不需要 API Key。

## 功能

- 项目背景与受团队列表约束的负责人
- 多个可编辑反馈源，使用稳定的 `F001` 样式编号
- 在浏览器端解析 TXT、Markdown、CSV、DOCX
- OpenRouter Chat Completions 集成，使用严格 JSON Schema 和服务端 Zod 校验
- 带源证据的可追溯修改任务
- 重复项、冲突、澄清问题、摘要与客户回复
- 可受约束地编辑优先级、状态与负责人
- 本地导出 CSV、Markdown、JSON
- 内置示例项目与示例报告

## 使用方式

1. 填写项目背景和可选团队成员。
2. 粘贴反馈、添加反馈源或上传支持的文件。
3. 输入当前 OpenRouter API Key，以及支持严格结构化输出的模型。
4. 运行分析，然后审阅、编辑、追溯并导出报告。

## 隐私模型

没有账户、数据库、Cookie、浏览器存储或项目历史。API Key 仅保留在当前 React 内存中，刷新页面后会清除。执行分析时，提取出的项目内容与 Key 会经服务端路由发送至 OpenRouter 和所选模型提供商，相关数据政策以提供商说明为准。

## 支持的文件类型

| 类型          | 处理方式                                     |
| ------------- | -------------------------------------------- |
| `.txt`、`.md` | 纯文本提取                                   |
| `.csv`        | 使用浏览器端 Papa Parse 转为带字段名的行文本 |
| `.docx`       | 使用浏览器端 Mammoth 提取原始文本            |

单文件最多 5 MB，最多 10 个文件，所有反馈提取后的字符总数最多 80,000。

## 本地安装

```bash
npm install
npm run dev
```

打开 `http://localhost:3000`。

## OpenRouter Key 与模型

请在当前分析中使用自己的 Key。默认值为已验证的 `openai/gpt-4o-2024-08-06`；OpenRouter 当前将其标注为支持 `response_format` 与 `structured_outputs`。你也可以手动输入其他兼容模型，RevisionFlow 不会静默切换模型。

## 开发命令

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run start
```

## 部署

RevisionFlow 是标准 Next.js 应用，可部署到 Vercel 或其他兼容 Node.js 的平台。无需环境变量，因为 API Key 由用户在每次分析中自行输入。部署平台需要允许对 `openrouter.ai` 的 HTTPS 出站访问。

## 限制与路线图

这是开源 MVP，不是托管式协作平台。v0.1.1 有意不提供账户、持久化、团队协作、PDF/OCR/音频/视频解析、第三方平台集成、自动修改或自动发送邮件。

未来规划（未在 v0.1.1 实现）：

- Gmail、Slack、Frame.io 集成
- Jira、Trello、Notion 导出
- 共享团队项目与保存的项目历史
- 客户审阅门户和组织模板

## 贡献

欢迎提交 Issue 和聚焦的 Pull Request。提交前请运行 lint、类型检查和测试。

## 许可证

[MIT](LICENSE)

## 免责声明

RevisionFlow 只整理用户提供的项目反馈，不能代替项目判断、客户确认或法律审查。
