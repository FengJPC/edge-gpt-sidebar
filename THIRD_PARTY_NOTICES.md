# Third-party components

The original project code uses PolyForm Noncommercial 1.0.0. The bundled
components below remain licensed by their respective authors under their
original terms. All upstream notices must be retained when redistributing.

| Component | Version | License | Bundled license |
| --- | --- | --- | --- |
| [Marked](https://github.com/markedjs/marked) | 17.0.5 | MIT | [marked-LICENSE.md](extension/vendor/marked-LICENSE.md) |
| [KaTeX](https://github.com/KaTeX/KaTeX) | 0.19.0 | MIT | [LICENSE](extension/vendor/katex/LICENSE) |
| [PDF.js](https://github.com/mozilla/pdf.js) | 5.6.205 | Apache-2.0 | [LICENSE](extension/vendor/pdfjs/LICENSE) |
| PDF.js Adobe character maps | bundled with PDF.js | BSD-style, see text | [cmaps/LICENSE](extension/vendor/pdfjs/cmaps/LICENSE) |
| PDF.js Foxit standard fonts | bundled with PDF.js | BSD-style, see text | [LICENSE_FOXIT](extension/vendor/pdfjs/standard_fonts/LICENSE_FOXIT) |
| PDF.js Liberation fonts | bundled with PDF.js | SIL OFL 1.1 | [LICENSE_LIBERATION](extension/vendor/pdfjs/standard_fonts/LICENSE_LIBERATION) |

Runtime scripts, fonts, PDF character maps and standard font data are bundled
locally under `extension/vendor/`. KaTeX package provenance and integrity are
recorded in `extension/vendor/katex/source.json`. Existing embedded upstream
notices are preserved. No runtime CDN is required.

Playwright is a development-only dependency, licensed under Apache-2.0. It is
not included in the extension package. pdf-lib (MIT) is a development-only
dependency used to create synthetic PDF test fixtures; it is also not bundled.
Git, Node.js, Microsoft Edge, ChatGPT and
OpenAI services are external tools or services, not project-owned components.
