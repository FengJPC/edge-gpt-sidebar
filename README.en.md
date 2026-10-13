# GPT Sidebar

[简体中文](README.md) · [Privacy](PRIVACY.md) · [License](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

An independent Microsoft Edge sidebar extension that uses your ChatGPT account.
**Not an official OpenAI or Microsoft product.** Version 0.4.0 supports manual installation; consult Partner Center for store review and release status.

## Features

- Chat history, search, rename, delete/undo and Markdown export.
- Model and supported reasoning-effort selection, font sizes, light/dark themes and Chinese/English UI.
- Context-menu selections, image paste, file drop/upload and editable attachment drafts.
- Optional autonomous public web search/open/find, off by default, with clickable citations and collapsed source lists retained in history and Markdown exports.
- Explicit page/PDF reads and visible-page screenshots; ordinary chat does not access pages automatically.
- Local Markdown/KaTeX rendering, PDF text extraction and downloadable text-file tools.
- Stop streaming responses; interrupted requests are not automatically resent.

## Web diagnostics

Open Settings → Web diagnostics → Export diagnostics JSON. Recording is enabled by default for new web-enabled requests; previous requests cannot be recovered. Turning recording off leaves search availability unchanged. Existing diagnostics can be exported or cleared independently.

The current browser profile retains the latest 50 API requests, up to 2 MB. Tool follow-up rounds have separate request records linked by a local generation_id. Records contain timestamps, model/effort, API HTTP status, available x-request-id/response_id, web call IDs/status/actions, query lists/URLs/find patterns, error summaries and source URLs. Raw chat, page bodies, attachments, headers and tokens are not intentionally recorded. Storage and export both project allowed fields and redact common credential patterns; queries, URLs and errors may still contain private information. Review before sharing. Diagnostics are not fed back to the model or included in chat Markdown exports.

Null means not exposed by the API; explicitly empty URLs stay empty. Query-to-result mappings are not guessed from aggregate tool sources. display_number is a sidebar label, not an internal model reference ID. Request HTTP status is not webpage HTTP status; a completed tool call does not prove readable content, and failed web calls may coexist with a completed response. started means no terminal event was observed; the server may still be running or the client may have been interrupted.

## Install

1. Download the repository ZIP and extract it, or clone it.
2. Open `edge://extensions/` and enable Developer mode.
3. Choose Load unpacked and select the **extension** directory.
4. Click the extension toolbar icon to open the sidebar.
5. Open Settings, click Continue with ChatGPT and authorize on the official OpenAI page yourself.
6. Return to the sidebar, refresh models, select one and send a test message.

No local helper, Node.js or Codex application is needed to run the extension.
To update, replace the files, reload the extension and reopen the sidebar. Do not uninstall if you want to preserve local conversations.

## Important boundaries

The **Web: off/on** button above the composer enables OpenAI's hosted `web_search` tool. Its setting persists in the current browser profile. When enabled, the model may autonomously search, open public pages, find text within pages and continue researching without asking permission for each operation; ordinary messages need not trigger a search. Turning it off removes the tool from new requests while preserving earlier sources. Source lists start collapsed; click their headings to expand. Reopening the panel or switching conversations resets expansion, while Markdown exports still retain sources.

Local-material restrictions apply to browser tabs and screenshots, not authorized public web search. Requests to read a supplied public URL do not automatically read an unrelated active tab. Instructions require the model to distinguish useful text from empty returns, errors or page shells and not treat a completed call as proof of verification; prompt instructions cannot guarantee every response will comply.

Search availability depends on the model, account and workspace policy. Unsupported search shows an error without automatic retries; turn it off or change models and resend manually. Queries may contain conversation information relevant to the question and are processed by OpenAI. This toggle grants no local tab, screenshot or file access; those actions still require explicit requests or buttons. Public webpage content is treated as material, not executable extension instructions.

The OAuth callback is an engineering adaptation: navigation to the fixed loopback
callback is intercepted without a local HTTP listener. Official local callback
documentation requires a listener. This is **not a claim of officially supported
browser-extension login**. Manual login/chat/sidebar use has been verified by the
maintainer, but multi-account distribution, refresh and all real-service tool
behaviors have not been fully validated. Preview eligibility and server behavior may change.

Requests use the authorized account's plan allowance. Chats are local and do not
sync with ChatGPT web history. Credentials, chats and attachments are stored in
local extension storage without OS credential-vault encryption. Disconnecting
locally does not revoke server-side authorization. See [Privacy](PRIVACY.md).

Attachments are drafts until sent: up to 3 files, 20 MB each. Supported images are
PNG/JPG/WebP; images are resized to a longest edge of 2048 px. PDF extraction is
limited to 60 pages/120000 characters, without OCR. Generated downloads are text
files with a configurable 1–5 MB limit; binary Word/PDF generation is unsupported.
Markdown exports retain web citations and sources, but do not embed images or generated file contents.

Disconnecting and signing in again reuses the saved client registration. Select a saved
account in Settings, or explicitly create a new registration for another account/workspace.
Existing credentials migrate automatically; token storage and automatic sign-in are unchanged.
Clearing extension data, uninstalling, or changing browser profiles can require a new registration.
A revoked registration is not silently replaced. This fix cannot merge existing server-side entries.

## Development

Node.js 22+:

```sh
npm ci
npm test
npm run package
```

The package includes only runtime files and license notices. On Windows with
Microsoft Edge installed, run `npm run test:browser`. Set `EDGE_EXECUTABLE_PATH`
to override the browser location. Browser checks use isolated temporary profiles,
mocked model requests and test materials, not a real account. Never use automated
profiles for real sign-in. See [Contributing](CONTRIBUTING.md).

## Licensing

Original project code is **source-available** under PolyForm Noncommercial 1.0.0.
Permitted noncommercial use, modification and redistribution do not require
publishing your modifications. Redistribution must include the license or its
URL and the Required Notice in [NOTICE](NOTICE). Commercial uses not permitted by
this license require separate authorization from [FengJPC](https://github.com/FengJPC).
The full [LICENSE](LICENSE) governs; bundled third-party components retain their
own licenses, including the bundled font/data licenses. Contributions do not transfer copyright or automatically
grant the maintainer commercial licensing rights.

Report sanitized issues only. Do not upload tokens, complete OAuth callbacks,
private conversations, browser profiles or personal attachments.

## Edge Add-ons candidate

Version 0.4.0 collapses source lists by default, resolves public web versus local material policy conflicts and avoids unrelated tab reads for public URL requests. Version 0.3.7 added optional web search, citations and source exports without new browser permissions. Before submitting 0.4.0, manually verify real-account search eligibility and publish the matching privacy policy. A GitHub release does not imply store certification. See [submission notes](store/submission.md) and [English listing](store/listing-en-US.md). `npm run assets:store` regenerates the bundled icons from the project-owned SVG using Windows Edge.

## Enhanced public reading and snapshots (0.4.0)

In Settings, enable **Allow direct public webpage and PDF reading** and grant HTTPS site access once in Edge. Hosted search remains available if permission is declined. With **Web: on**, the model can autonomously use `public_web.read_url`, `find_in_source` and `read_source`. Turning off Web or enhanced reading removes these tools from new requests; the latter does not automatically revoke existing site permissions (manage those in Edge).

The browser fetches public HTTPS URLs anonymously, without cookies, authorization headers or referrer information. It does not read local/logged-in tabs, execute page scripts, bypass CAPTCHAs or follow redirects. Use a verified final public URL or hosted search for redirects. Local/internal names, literal IP addresses, non-default ports and credential-bearing URLs are rejected; the browser does not expose resolved DNS addresses for comprehensive checks. Directly contacted websites can see your network address. Static extraction does not render dynamic pages or guarantee complete content.

Downloads are limited to 2 MB for HTML/text and 20 MB for PDFs, with a 30-second timeout. PDF extraction processes at most 60 pages/120000 UTF-16 characters; no OCR. Results distinguish success, partial content, blocked, timeout, fetch/parse failure, missing permission and internal error. Limited response-text rules detect some error pages, CAPTCHA notices and shells; they are not a complete content-quality assessment. Unknown fields stay null. Failed snapshots are not automatically retried; clear this conversation’s snapshots and manually resend only when appropriate.

Each conversation stores up to 8 immutable snapshots and 480000 UTF-16 characters, evicting oldest snapshots when necessary. Fresh fetches get distinct `public_` IDs and timestamps; repeated URL reads reuse the latest snapshot by default. Refresh creates a new version only for a previously readable, error-free snapshot. Hosted reference IDs and public snapshot IDs are separate. Find returns a literal match count within stored text, positions/lines and at most 8 short contexts. Chunk reads return at most 12000 characters and `next_offset`. Truncated snapshots are not complete pages.

Settings lets you inspect, export TXT or clear snapshots. Previews show up to 12000 characters; TXT contains complete stored text and metadata. Clearing snapshots retains messages, citations and already-submitted context; delete the conversation to remove those local copies. Missing/evicted IDs fail explicitly instead of silently downloading replacements. Stop aborts a pending read and prevents follow-up submission. Each answer permits at most 24 enhanced tool calls and 12 model rounds (the final round has no tools), with the existing 10-file limit retained.

Diagnostic `calls` remain hosted metadata only; `local_calls` contain actual public-reader request/source IDs, URLs, page HTTP status, content type, stages, truncation, lengths and PDF-page/match counts. `extracted_chars` counts text actually extracted before clipping (PDF: processed pages only). `prepared_output_chars` counts serialized tool JSON; `submitted_output_chars` means dispatched in a subsequent API request, not proven receipt/understanding by the model. `delivered_chars` remains null. Page bodies and complete tool response text are excluded. Cached reads retain their original fetch time.
