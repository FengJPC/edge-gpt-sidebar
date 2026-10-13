# 数据与隐私 / Data and privacy

本项目是第三方 Edge 扩展，不是 OpenAI 或 Microsoft 官方产品。

## 保存在本机的数据

账号授权信息（包括访问和刷新令牌）、模型偏好、界面设置、聊天记录、
未发送草稿和附件保存在当前浏览器配置的扩展本地存储。
不使用浏览器同步；聊天不与 ChatGPT 官网历史同步。
浏览器存储隔离不等同于操作系统凭据库加密。

## 联网诊断记录

默认记录开启联网后的新 API 请求；可在设置中关闭、导出 JSON 或单独清空。
当前浏览器配置保留最近 50 次请求，最多 2 MB，包括请求时间、模型和思考强度、
API 请求/响应编号、HTTP 状态、联网调用编号/操作/状态、搜索查询、网址、
页面内查找词、错误摘要和来源网址。它不主动保存完整聊天、网页正文、附件、请求头或令牌，
也不把诊断送回模型或自动上传。常见凭据格式会在存储与导出时脱敏；
搜索查询、网址和错误摘要仍可能含私人信息，自动脱敏不能保证识别所有敏感内容。
分享导出前请检查；清空诊断不清除聊天或登录信息，已导出的文件需要自行删除。

## 对外传输

登录在 OpenAI 官方页面完成。扩展与 `auth.openai.com` 交换和刷新授权，
从 `api.openai.com` 读取模型，并在用户发送消息时提交本次消息及相关上下文、
选文、资料和图片。工具创建文件时，可通过后续请求向模型反馈创建结果。
OpenAI 服务的数据处理适用其自身条款和政策。

联网搜索默认关闭。用户开启后，发送消息时会允许模型按需要使用 OpenAI 托管的搜索工具，
搜索查询及与问题有关的上下文可能用于查询公共网络，由 OpenAI 服务处理。
引用和来源链接随聊天保存在本机，并包含在 Markdown 导出中。关闭开关不会删除已有来源。
联网开关不自动读取用户浏览器标签页，也不更改已有站点访问权限。

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
「断开」删除本机保存的登录令牌，保留账号显示信息、应用登记编号和安装标识供下次复用；不会清除聊天，也不撤销服务端授权；
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

Web search is off by default. Enabling it allows the model to use OpenAI's hosted
search tool as needed when a message is sent. Queries and relevant conversation
information may be used to search the public web and are processed by OpenAI.
Citations and source links are stored locally with the conversation and retained
in Markdown exports; disabling search does not remove previous sources. This
toggle does not read local browser tabs or change website permissions.

Ordinary chat does not automatically access pages. Explicit read/view requests
or user actions obtain material; selections and uploaded/pasted files are staged
as drafts until sent. Screenshots can include personal data visible on the page.

Delete conversations to remove their local messages and request context.
Disconnect removes locally stored tokens while retaining account display information,
client registrations and the installation identifier for reuse. It does not clear chats or
revoke server-side access. Revoke access in ChatGPT settings. Uninstalling removes
extension storage, but does not remove exported files or server-side data.

Web diagnostics are enabled by default for new web-enabled API requests and
can be disabled, exported as JSON or cleared separately in Settings. The local
browser profile retains up to 50 requests and 2 MB, including timestamps,
model/effort, request/response IDs, API HTTP status, web call IDs/actions/status,
queries, URLs, find patterns, error summaries and source URLs. Raw chat, page
bodies, attachments, headers and tokens are not intentionally recorded. Logs
are not sent to the model or automatically uploaded. Common credentials are
redacted at storage and export, but queries, URLs and errors may contain private
information and automatic redaction cannot cover everything. Review before
sharing. Clearing diagnostics preserves login and chats; exported files must
be deleted separately.
