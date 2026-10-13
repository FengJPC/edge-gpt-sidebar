# 数据与隐私 / Data and privacy

本项目是第三方 Edge 扩展，不是 OpenAI 或 Microsoft 官方产品。

## 保存在本机的数据

账号授权信息（包括访问和刷新令牌）、模型偏好、界面设置、聊天记录、
未发送草稿和附件保存在当前浏览器配置的扩展本地存储。
不使用浏览器同步；聊天不与 ChatGPT 官网历史同步。
浏览器存储隔离不等同于操作系统凭据库加密。

## 对外传输

登录在 OpenAI 官方页面完成。扩展与 `auth.openai.com` 交换和刷新授权，
从 `api.openai.com` 读取模型，并在用户发送消息时提交本次消息及相关上下文、
选文、资料和图片。工具创建文件时，可通过后续请求向模型反馈创建结果。
OpenAI 服务的数据处理适用其自身条款和政策。

用户主动读取在线 PDF 时，扩展也会访问该 PDF 的原始网址；请求不附带站点 Cookie。
网页正文和 PDF 解析、图片缩放及文本文件创建在本机进行。
项目不设自有后端、遥测或分析服务。

## 页面访问

普通聊天不自动读取网页或截图。只有明确要求读取/查看当前页面，或点击读取、
截图、上传按钮时才取得相关资料。右键选文、上传和粘贴的附件先进入草稿，
用户发送后才提供给模型。网页读取可能需要用户授权该站点。
截图只捕获当前网页可见区域；可能包含页面上显示的个人信息。

## 删除与断开

历史记录可在扩展中删除，当前删除操作可撤销。附件草稿可移除；
已发送资料可能仍包含在相应对话及请求上下文中，需要删除整个对话以移除本地副本。
「断开」删除本机保存的账号授权，不会清除聊天，也不撤销服务端授权；
服务端授权请在 ChatGPT 设置中撤销。
卸载扩展会移除其浏览器存储，但不会删除已导出的文件或服务端已有数据。

---

This independent extension stores credentials, preferences, conversations,
drafts and attachments in the current browser profile's local extension
storage, without browser sync or operating-system credential-vault encryption.
Chats do not sync with ChatGPT web history.

Sign-in and token refresh use OpenAI's authorization service. Sending a message
submits its text, relevant conversation context and attached material to the
OpenAI API. Online PDF reads also contact the original PDF host without cookies.
There is no project-operated backend, telemetry or analytics service.

Ordinary chat does not automatically access pages. Explicit read/view requests
or user actions obtain material; selections and uploaded/pasted files are staged
as drafts until sent. Screenshots can include personal data visible on the page.

Delete conversations to remove their local messages and request context.
Disconnect removes locally stored credentials, but does not clear chats or
revoke server-side access. Revoke access in ChatGPT settings. Uninstalling removes
extension storage, but does not remove exported files or server-side data.
