# GPT Sidebar

[简体中文](README.md) · [Privacy](PRIVACY.md) · [License](LICENSE) · [Third-party notices](THIRD_PARTY_NOTICES.md)

An independent Microsoft Edge sidebar extension that uses your ChatGPT account.
**Not an official OpenAI or Microsoft product.** Version 0.3.7 supports manual installation; consult Partner Center for store review and release status.

## Features

- Chat history, search, rename, delete/undo and Markdown export.
- Model and supported reasoning-effort selection, font sizes, light/dark themes and Chinese/English UI.
- Context-menu selections, image paste, file drop/upload and editable attachment drafts.
- Optional web search, off by default, with clickable citations and sources retained in history and Markdown exports.
- Explicit page/PDF reads and visible-page screenshots; ordinary chat does not access pages automatically.
- Local Markdown/KaTeX rendering, PDF text extraction and downloadable text-file tools.
- Stop streaming responses; interrupted requests are not automatically resent.

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

The **Web: off/on** button above the composer enables OpenAI's hosted `web_search` tool. Its setting persists in the current browser profile. When enabled, the model chooses whether to search; ordinary messages need not trigger a search. Turning it off removes the tool from new requests while preserving earlier sources.

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

Version 0.3.7 adds optional web search, citations and source exports without new browser permissions. Version 0.3.6 fixed duplicate client registrations after disconnecting. Before submitting 0.3.7, manually verify real-account search eligibility and publish the matching privacy policy. A GitHub release does not imply store certification. See [submission notes](store/submission.md) and [English listing](store/listing-en-US.md). `npm run assets:store` regenerates the bundled icons from the project-owned SVG using Windows Edge.
