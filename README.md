# GPT 侧边栏 / GPT Sidebar

[English](README.en.md) · [数据与隐私](PRIVACY.md) · [许可证](LICENSE) · [第三方许可](THIRD_PARTY_NOTICES.md)

在 Microsoft Edge 侧栏中使用自己的 ChatGPT 账号聊天，支持右键选文、按需读取网页/PDF、图片与文件草稿、LaTeX 公式和 Markdown 导出。

**这是第三方个人项目，不是 OpenAI 或 Microsoft 官方产品。** 当前版本 **0.3.5**，仅提供手动加载安装，尚未上架 Edge 扩展市场。

## 功能

- 紧凑侧栏：模型与支持的思考强度选择、12–20 px 字号、明暗主题、简体中文/English 界面。
- 历史对话：搜索、切换、重命名、删除与撤销、导出 Markdown。空白对话不进入历史；未发送草稿保留。
- 右键选文进入可编辑草稿，不自动发送。
- 按需读取当前网页或在线 PDF、截取当前网页可见区域。普通聊天不会自动读取资料。
- 粘贴图片、拖放和上传文件；支持 PNG/JPG/WebP、PDF 和文本类文件。每次最多 3 份、每份最多 20 MB。
- PDF 本地提取文字，最多 60 页/120000 字符；扫描版没有 OCR。图片最长边缩放至 2048 px。
- Markdown 和本地 KaTeX 公式渲染；导出使用 Obsidian 公式分隔符。
- 按用户明确的文件生成请求，创建可下载的文本文件。单文件上限可设为 1–5 MB；不执行文件，不生成 Word/PDF 等二进制文件。
- 流式回答可停止；中断不会自动重发。对话和授权保存在当前浏览器配置的本地扩展存储。

## 安装

1. 下载本仓库源码 ZIP 并解压，或使用 Git 克隆。
2. 打开 `edge://extensions/`，开启「开发人员模式」。
3. 点击「加载解压缩的扩展」，选择解压后的 **`extension` 文件夹**。
4. 在 Edge 工具栏点击扩展图标，打开侧栏。
5. 打开设置，点击 **Continue with ChatGPT**，亲自在 OpenAI 官方页面完成登录和授权。
6. 返回侧栏，点击「刷新模型」，选择模型并发送测试问题。

运行扩展无需 Node.js、本地辅助程序或 Codex。Windows 用户也可以运行「打开手动安装入口.cmd」打开扩展管理页和目录。

更新已有安装：替换文件后，在 `edge://extensions/` 点击「重新加载」，关闭并重新打开侧栏。无需卸载；卸载会删除扩展的本地记录。

若登录反复出现人机验证，请停止重复尝试，并手动确认同一浏览器能否登录 ChatGPT 官网。不要使用自动化测试配置进行真实账号登录。

## 使用资料和文件

选文、上传、粘贴或按钮读取的资料先进入草稿，可移除，发送后才交给模型。明确说「读一下当前网页」或「看一下左边这篇论文」也可触发资料读取；一般聊天不触发。

网页读取可能需要授权当前站点。截图前可能需要在该网页点击一次扩展图标，以授予临时访问权限。浏览器内部页和本地 PDF 请使用上传；加密 PDF 需先解锁。仅支持列出的图片和文本格式，不支持直接读取 Word/Excel。

历史导出包含聊天文字、公式和生成文件的名称；生成文件内容需点击附件单独下载，图片不会嵌入 Markdown 导出。

## 登录与服务边界

本扩展采用官方授权端点、PKCE 和身份签名验证，不读取 ChatGPT 官网 Cookie、Codex 凭据或密码。请求使用已授权的 ChatGPT 套餐额度，不与官网聊天历史同步；可用模型与额度取决于账号和服务权限。

**当前回调接收方式是工程适配：** 扩展观察登录标签页导航到 `http://127.0.0.1:1455/auth/callback`，不启动本地 HTTP 监听器。官方文档中的本地回调流程依赖监听器，因此不能将本实现描述成 OpenAI 官方支持的浏览器扩展登录方式。

维护者已手动验证账号登录、真实回答、右键选文与侧栏显示；跨账号发行兼容性、授权刷新及所有资料/工具的真实服务行为尚未完整验证。服务端接口、预览资格和授权行为可能变化，登录或请求可能因此失效。

授权、聊天和附件存储没有使用操作系统凭据库加密。「断开」只移除本机授权；服务端撤销请在 ChatGPT 设置中操作。详见 [PRIVACY.md](PRIVACY.md)。

官方参考：[注册与登录](https://developers.openai.com/siwc/token-sharing-open-source/sign-in)、[模型与推理](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference)、[预览限制](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations)。这些文档不代表对本项目的认可或兼容性保证。

## 开发与验证

需要 Node.js 22 或更新版本：

```sh
npm ci
npm test
npm run package
```

`npm test` 包含 19 项检查，不需要真实账号。构建产物是 `dist/gpt-sidebar-0.3.5.zip`，仅含扩展运行文件与许可说明。

Windows 中安装 Microsoft Edge 后运行 `npm run test:browser`。可通过环境变量 `EDGE_EXECUTABLE_PATH` 指定浏览器路径。测试使用独立临时配置、模拟模型请求和测试素材，不接触日常浏览器账号。

已有 Edge 检查覆盖侧栏调用、草稿和历史、语言与主题、公式渲染、模拟文件工具、PDF 提取、图片粘贴/拖放、停止和中断恢复。模拟请求通过不代表真实服务的全部行为已验证。贡献要求见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 许可与商业授权

项目自有代码采用 **PolyForm Noncommercial License 1.0.0**，允许许可证规定的非商业使用、修改和再分发，不强制公开修改版源码。再分发须附许可证或其链接，并保留 [NOTICE](NOTICE) 中的 Required Notice。

默认许可证未允许的商业用途需事先向 [FengJPC](https://github.com/FengJPC) 取得单独授权。完整条款以 [LICENSE](LICENSE) 为准；其他人不能擅自取消原有代码的非商业限制。第三方组件及字体继续适用各自许可，详见第三方许可说明。

由于带有非商业限制，本项目是 **源码可用（source-available）** 项目，不宣称符合 OSI 开源定义。提交贡献不会转让贡献者版权，也不会自动授予维护者商业授权权利。

请通过仓库 Issues 报告经过脱敏的问题，不要上传令牌、完整授权回调、真实聊天或个人资料。

## Edge 扩展市场候选材料

0.3.5 新增自有图标和中英文商店元数据，移除不需要的 loopback 主机访问权限（仍以 webNavigation 监听回调）。当前尚未上架或提交审核。

提交字段、权限/数据申报和测试备注见 [store/submission.md](store/submission.md)，商店文案见 [中文](store/listing-zh-CN.md) / [English](store/listing-en-US.md)。运行 `npm run assets:store` 可在 Windows Edge 下从自有 SVG 重新生成图标；正常构建直接使用仓库已包含的 PNG。
