# Third-party notices and governed graphics provenance

This notice ships with `@rottay/design-system`. Its machine-audited source is
`provenance/graphics/pack-allowlist.json`. License labels below describe the
pinned source records; they do not grant trademark, affiliation, endorsement,
publicity, or other brand-use rights.

## Functional icon suppliers

### Phosphor Icons — `@phosphor-icons/react@2.1.10`

- Usage: bundled SSR glyphs behind the supplier-independent semantic `Icon` facade.
- Source: https://github.com/phosphor-icons/react
- License: MIT; the complete text is reproduced below and archived at
  `provenance/graphics/licenses/phosphor-icons-react-LICENSE`.

## BrandMark source and renderer

The governed catalog is `thesvg@3.2.6` and the external renderer is
`@thesvg/react@3.2.7`.

- Catalog source: https://github.com/glincker/thesvg/tree/main/packages/thesvg
- Renderer source: https://github.com/glincker/thesvg/tree/main/packages/react
- Package license: MIT; the complete text is reproduced below and archived at
  `provenance/graphics/licenses/thesvg-LICENSE`.

| BrandMark | Catalog slug | Asset license in pinned catalog | Source URL |
| --- | --- | --- | --- |
| OpenAI | `openai` | MIT | https://openai.com/ |
| Anthropic | `anthropic` | CC0-1.0 | https://www.anthropic.com/ |
| GitHub | `github` | CC0-1.0 | https://github.com/ |
| Google | `google` | CC0-1.0 | https://www.google.com/ |
| LinkedIn | `linkedin` | MIT | https://www.linkedin.com/ |
| Instagram | `instagram` | CC0-1.0 | https://www.instagram.com/ |
| X | `x` | CC0-1.0 | https://x.com |
| Google Chrome | `google-chrome` | CC0-1.0 | https://www.google.com/chrome |
| Microsoft | `microsoft` | MIT | https://www.microsoft.com/ |
| Greenhouse | `greenhouse` | CC0-1.0 | https://brand.greenhouse.io/brand-portal/p/6 |
| Indeed | `indeed` | CC0-1.0 | https://indeed.design/resources |

CC0-1.0: https://creativecommons.org/publicdomain/zero/1.0/

All names, logos, and marks remain property of their respective owners. The
catalog license and inclusion in this package do not grant trademark permission.
Consumers must follow each owner’s current brand and trademark guidelines and
must not imply affiliation, sponsorship, or endorsement.

## AWS CloudServiceMark assets — CC-BY-ND-2.0

The following four AWS service artworks are attributed to Amazon Web Services,
Inc. They are rendered from their pinned upstream `@thesvg/react` components,
without local edits to path geometry, color, font, or artwork elements. The
design system selects an upstream-provided `16`, `32`, `64`, or `default`
optical variant and adds wrapper-level sizing and accessibility attributes; it
does not create or distribute adapted artwork. Consumers remain responsible
for preserving proportions and otherwise avoiding altered artwork.

| CloudServiceMark | Catalog slug | License | Source URL | Local modification |
| --- | --- | --- | --- | --- |
| AWS Lambda | `aws-aws-lambda` | CC-BY-ND-2.0 | https://aws.amazon.com/lambda/ | None |
| Amazon Bedrock | `aws-amazon-bedrock` | CC-BY-ND-2.0 | https://aws.amazon.com/bedrock/ | None |
| Amazon Simple Storage Service | `aws-amazon-simple-storage-service` | CC-BY-ND-2.0 | https://aws.amazon.com/simple-storage-service/ | None |
| Amazon RDS | `aws-amazon-rds` | CC-BY-ND-2.0 | https://aws.amazon.com/rds/ | None |

- CC BY-ND 2.0 license: https://creativecommons.org/licenses/by-nd/2.0/
- AWS Trademark Guidelines: https://aws.amazon.com/trademark-guidelines/

No AWS trademark permission, affiliation, sponsorship, or endorsement is
claimed. Consumers must not alter the artwork and must follow the current AWS
Trademark Guidelines and any other agreement that applies to their use.

## FeaturePictogram assets

`FeaturePictogram` artwork is not third-party content. The eight packaged
pictograms are original Rottay assets governed by
`LicenseRef-Rottay-Original-Product-Asset-1.0`, rights holder Rottay, and the
`internal-and-bundled-product` distribution policy:

- `ai-assistant`
- `analytics-insight`
- `candidate-evidence`
- `empty-search`
- `event-moment`
- `secure-access`
- `team-collaboration`
- `workflow-automation`

## Font packs — SIL Open Font License 1.1

The opt-in white-label font packs under `dist/fonts/` ship latin-subset woff2
binaries of six typeface families, all licensed under the SIL Open Font
License 1.1 (https://openfontlicense.org/open-font-license-official-text/).
The binaries were fetched from Google Fonts at pack-creation time and are
served only through the opt-in `@rottay/design-system/fonts/<pack>.css`
subpath exports; they never enter `dist/styles.css`.

| Family | Pack(s) | Files | License | Source |
| --- | --- | --- | --- | --- |
| Fraunces | `editorial-display` | `fraunces-latin-variable.woff2` | OFL-1.1 | https://fonts.google.com/specimen/Fraunces |
| Newsreader | `editorial-text` | `newsreader-latin-variable.woff2` | OFL-1.1 | https://fonts.google.com/specimen/Newsreader |
| Space Grotesk | `grotesk-display` | `space-grotesk-latin-variable.woff2` | OFL-1.1 | https://fonts.google.com/specimen/Space+Grotesk |
| Public Sans | `humanist-text` | `public-sans-latin-variable.woff2` | OFL-1.1 | https://fonts.google.com/specimen/Public+Sans |
| Outfit | `geometric-display` | `outfit-latin-variable.woff2` | OFL-1.1 | https://fonts.google.com/specimen/Outfit |
| IBM Plex Mono | `plex-mono` | `ibm-plex-mono-latin-400.woff2`, `ibm-plex-mono-latin-600.woff2` | OFL-1.1 | https://fonts.google.com/specimen/IBM+Plex+Mono |

The OFL-1.1 reserves the font names for their copyright holders; the packs do
not rename any family. Per-family copyright statements and the archived
license texts are owed under `provenance/` before the next npm publish.

## License texts

### Phosphor Icons — MIT

MIT License

Copyright (c) 2020 Phosphor Icons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### theSVG packages — MIT

MIT License

Copyright (c) 2025 thesvg.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
