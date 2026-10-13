# Edge Add-ons 提交说明

状态：0.3.5 提交候选材料，尚未提交、审核或上架。开发者账号需由发布者注册。

## 注册

1. 打开 https://partner.microsoft.com/dashboard/microsoftedge/overview ，使用个人 Microsoft 账号登录。
2. 如果未出现 Edge 注册表，进入 Account settings → Programs → Microsoft Edge → Get started。
3. 对个人项目选择 Individual；国家/地区填写实际居住地。国家/地区和账号类型注册后不能随意修改。
4. Publisher display name 可尝试 FengJPC，是否可用以微软后台为准；联系信息填写真实可联系的信息。
5. 发布者本人阅读、决定是否接受开发者协议，完成注册，并检查邮件和验证状态。

微软文档说明 Edge 项目不收注册费。不要误进入其他收费的开发者计划。

## 创建产品和上传

- 在 Microsoft Edge 工作区创建新扩展。
- 包：`dist/gpt-sidebar-0.3.5.zip`，ZIP 根目录是 manifest.json。
- 可见性：公开（Public）以便商店搜索；市场范围由发布者在后台确认。
- 分类：可选 Productivity，按后台实际分类调整。
- 主页：https://github.com/FengJPC/edge-gpt-sidebar
- 支持：https://github.com/FengJPC/edge-gpt-sidebar/issues
- 隐私政策：https://github.com/FengJPC/edge-gpt-sidebar/blob/main/PRIVACY.md
- 中文和英文分别使用 listing-zh-CN.md / listing-en-US.md。
- Logo：`store/logo-300.png`，300 × 300，自有图形，不使用第三方品牌 Logo。
- 截图可选；此次未准备商店截图，不把测试账户或模拟回答当成真实账号截图发布。

## 单一用途 / Single purpose

在 Edge 侧栏中帮助用户通过自己授权的 ChatGPT 账号，围绕主动提供或明确要求读取的资料进行对话，并管理本地对话和导出笔记。

Help users converse with their authorized ChatGPT account beside their browsing,
using material they explicitly provide or request, and manage/export local chats.

## 权限用途（英文可粘贴到审核表）

| Permission | Justification |
| --- | --- |
| sidePanel | Displays the conversation interface beside the current webpage. |
| storage | Stores account authorization, local chats, drafts and preferences in this browser profile. No sync storage is used. |
| unlimitedStorage | Local conversations can contain images and PDF/text attachments larger than the normal local storage quota. No site storage is accessed. |
| contextMenus | Adds a selection-only menu item. Selected text is staged as an editable draft, not sent automatically. |
| webNavigation | Observes navigation in the dedicated sign-in tab to the fixed loopback OAuth callback. A URL-filtered listener verifies the expected tab, state and expiry. No browsing history is collected. |
| activeTab | Provides temporary access after a user gesture for an explicit visible-page screenshot or page read. |
| tabs | Resolves the active page URL/title and sign-in tab, and checks that the requested page has not changed before reading or capturing it. It does not scan all tabs for content. |
| scripting | Injects the bundled text-extraction function into the user-requested webpage. Form/input/hidden content is excluded. No remote scripts are injected. |
| auth.openai.com | Performs official authorization/token exchange and fetches signing keys to validate identity. |
| api.openai.com | Loads available models and sends user messages and selected conversation context to OpenAI on user request. |
| Optional http/https hosts | Requests permission for the current site only when the user explicitly clicks the read-page/PDF action. Enables local text extraction and downloading that page's PDF. Never grants broad website access silently. |

There is no host permission for the loopback callback: it is observed through
webNavigation, not fetched by the extension.

## 远程代码 / Remote code

选择「不使用远程代码」。运行的 JS、Markdown/公式/PDF 解析组件和字体在包内。
OpenAI 响应作为数据处理，不作为代码执行；生成文件仅供下载，不由扩展执行。
本地 PDF 配置关闭动态求值及 Wasm。登录页面是外部网页，不在扩展中执行其脚本。

## 用户数据申报

不要选择「不处理任何用户数据」。按后台当前字段如实勾选/说明：

- 身份信息：登录账号的邮件/名称和身份标识（本机存储）。
- 身份验证信息：访问、刷新和身份令牌，用于已授权的服务请求。
- 用户主动输入/提供的消息、图片、文本和 PDF 内容；会话上下文发送到 OpenAI。
- 主动选择/读取页面的 URL、标题、正文或可见页面截图；并非后台收集完整浏览历史。

声明无出售用户数据、广告分析或与核心功能无关的用途；没有项目自有后端。
具体勾选项必须与实际代码、PRIVACY.md 和后台的最新措辞一致，最终声明由发布者确认。

## 给审核人员的测试备注（英文）

This is an independent, third-party extension. It is not an OpenAI or Microsoft
product. Running it requires no local helper or Codex application.

Open the toolbar icon to display the sidebar. Settings → Continue with ChatGPT
opens the official OpenAI sign-in page. A ChatGPT account eligible for the relevant
preview authorization and inference access is required; account-specific model
availability and plan limits apply. We do not provide the publisher's personal
account, password or tokens. If eligible access is unavailable for review, please
contact the publisher for clarification rather than assuming a successful test.

The callback implementation is an engineering adaptation: webNavigation observes
the dedicated sign-in tab navigating to http://127.0.0.1:1455/auth/callback, then
validates state/tab/expiry, PKCE and the identity signature and exchanges the code
at the official endpoint. There is no local HTTP listener. This differs from the
listener-based local flow in the official service documentation; we do not claim
official browser-extension callback support. Manual sign-in/chat has been tested
by the maintainer, but access for all accounts is not guaranteed. If this adaptation
cannot be certified, please state the specific requirement that prevents approval.

After sign-in, refresh models, choose one and send a short message. Right-click
selected page text: it appears in the draft without being sent. Ordinary chat
does not read webpages or screenshots. Use the read button, screenshot button or
an explicit read/view instruction to obtain material, then send it. Upload/paste/drop
files to stage them; remove them before sending if desired.

History is local. Blank chats are omitted; drafts are preserved. Stop aborts the
request and it is not automatically resent. Disconnect removes local authorization;
server-side authorization is revoked in ChatGPT settings. See the privacy policy
for stored/transmitted data. No remote executable code is used.

## 提交前检查与当前限制

- 注册和账号验证完成后，确认上传包的后台校验结果。
- 建议发布者在新的日常浏览器配置中手动验证登录、刷新模型、聊天、右键草稿和资料读取。
- 自动测试用模拟请求，不能代替新的账号/扩展 ID 发行兼容性验证。
- 0.3.5 尚未由发布者重新验证真实账号登录；不要向审核人员声称这一项已完成。
- 商业限制许可证已经写入包和商店文案；第三方组件保留自身许可证。
- 根据后台实际页面确认权限说明、数据申报和隐私 URL。
- 完成并核对所有内容后，再由发布者提交审核；这不等于立即上架。

参考：
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/publish-extension
- https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account
- https://learn.microsoft.com/en-us/legal/microsoft-edge/extensions/developer-policies
