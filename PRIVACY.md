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

普通聊天不自动读取用户当前标签页或截图。只有明确要求读取/查看当前页面，或点击读取、
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

Ordinary chat does not automatically access local browser tabs or screenshots. Explicit read/view requests
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

## 可选增强读取 / Optional enhanced public reading

增强公共读取默认关闭；用户在设置中一次性授权 HTTPS 网站访问后，联网开启时模型可以直接匿名读取公开 URL。扩展不携带网站 Cookie、Authorization 或来源页面信息，不读取本地标签页、不执行页面脚本、不绕过验证，也不跟随重定向。公开网站会看到直接请求的网络地址。读取到的文字、请求网址、获取时间和状态以每对话独立快照保存在扩展本地存储；相关正文片段经工具结果随后续请求交给 OpenAI。每对话最多 8 份、480000 字符，最旧资料可能被淘汰。快照不与其他对话或浏览器同步，TXT 导出需由用户主动进行。

设置中可单独清空快照，但已经发送的内容可能仍在聊天及模型请求上下文中；删除整个会话移除相应本地副本。关闭增强读取不会自动撤销已有站点访问权限，可在 Edge 扩展管理页调整。联网诊断新增增强工具调用元数据、HTTP 状态、错误阶段和文字长度，不包含完整正文，仍按既有诊断保留/脱敏规则处理。

Enhanced reading is off by default. After explicit HTTPS site permission in Settings, Web-enabled requests can allow anonymous direct public URL reads. These omit site cookies, Authorization and referrer information, never execute page scripts, follow redirects or bypass verification, and do not access local tabs. Contacted public hosts see your network address. Extracted text, URLs, timestamps and status are stored as conversation-local snapshots (up to 8 and 480000 characters; oldest snapshots may be evicted); relevant chunks are submitted to OpenAI as subsequent tool outputs. Snapshots do not sync across conversations or browsers. TXT exports require user action.

Clearing snapshots retains previously submitted chat/context; delete the conversation to remove corresponding local copies. Disabling enhanced reading does not automatically revoke site permission; manage it in Edge. Diagnostic metadata now includes these reader calls, observed HTTP status, failure stages and lengths, but excludes full page bodies and remains subject to the existing retention/redaction rules.
