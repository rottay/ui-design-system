'use client';

/**
 * DISPLAY — CONTENT scene — Typography + MarkdownView + CodeBlock + Image +
 * Carousel + QRCode.
 *
 * Six families grouped because each one renders CONTENT AUTHORED ELSEWHERE
 * (prose, source, a photo, a slide, an encoded value) rather than describing
 * structured application data the way `display-collections` does. This is
 * the group where "realistic content, including at least one long-content
 * case" is least optional — a heading, a markdown doc, a code sample, an
 * image caption and a QR payload are all naturally variable-length in real
 * use, so each family's realistic case already carries its long-content case
 * inline (a long line in the code sample, a long blockquote in the markdown
 * doc, a long QR value) rather than as a separate row, matching
 * `display-collections`'s reasoning.
 *
 * READINESS MARKERS. Same technique as the other new display scenes: each
 * family's primary specimen is wrapped in a plain
 * `data-testid="lab-display-<family>"` span/div this scene owns, independent
 * of the internal DOM/class names three other lanes are rewriting
 * concurrently. See `capture-lab.mjs` READINESS['display-content'].
 */

import {
  Carousel,
  CodeBlock,
  Heading,
  Image,
  Link,
  MarkdownView,
  Paragraph,
  QRCode,
  Text,
  Typography,
} from '@rottay/design-system';

import { PLACEHOLDER_IMAGE_SRC, SceneFrame, SpecimenRow, TORTURE_CONTENT, Vignette } from '../../chrome';

/** Realistic multi-block document: heading, bold/list, link + inline code,
 * a long blockquote (the long-content case), a table, and a fenced code
 * block — exercises MarkdownView's default renderer for every block type
 * `MarkdownBlockNode` names. */
const MARKDOWN_SOURCE = `## Reconciliation summary

Twelve records were reviewed against the published ledger this quarter. **Eight** were approved without condition, three are pending a follow-up attachment, and one was returned for resubmission.

- Approved: 8
- Pending: 3
- Returned: 1

See the [full ledger](https://example.org/ledger) for line-item detail, or run \`pnpm reconcile --quarter=2026Q3\` locally.

> ${TORTURE_CONTENT.longParagraph}

| Reviewer | Status |
| --- | --- |
| Jane Doe | Approved |
| Sam Lee | Pending |

\`\`\`ts
const total = records.reduce((sum, r) => sum + r.amount, 0);
\`\`\`
`;

/** A realistic snippet whose last line is intentionally long (a real-world
 * long import path) — CodeBlock's long-content failure mode is horizontal
 * overflow/wrap on ONE line, not a long block, so this is the correct
 * torture shape rather than a separately-labeled long-content instance. */
const CODE_SAMPLE = `import { computeQuarterlyReconciliationSummary } from '@rottay/dm-finance/reporting/quarterly-reconciliation-summary';

export function summarize(records: LedgerRecord[]) {
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  return { total, count: records.length };
}`;

export function DisplayContentScene() {
  return (
    <SceneFrame title="display — content: typography + markdownview + codeblock + image + carousel + qrcode">
      {/* ---- Typography ---- */}
      <SpecimenRow axis="typography — headings, text weights/colors, paragraph lineClamp, link">
        <div data-testid="lab-display-typography" style={{ display: 'block', minInlineSize: 260, maxInlineSize: 420 }}>
          <Heading level="h2" style={{ margin: 0 }}>
            Quarterly reconciliation
          </Heading>
          <Text color="secondary" style={{ margin: 0 }}>
            Finance • Q3 2026
          </Text>
          <Paragraph lineClamp={2} style={{ marginBlockStart: 8 }}>
            {TORTURE_CONTENT.longParagraph}
          </Paragraph>
          <Link href="https://example.org/ledger">View the full ledger</Link>
        </div>
        <Typography.Text weight="semibold" color="primary">
          Typography.Text namespace form
        </Typography.Text>
      </SpecimenRow>
      <SpecimenRow axis="typography — long content, unbroken token, es">
        <Heading level="h4" style={{ margin: 0, maxInlineSize: 320 }}>
          {TORTURE_CONTENT.longLabel}
        </Heading>
        <Text style={{ maxInlineSize: 220, wordBreak: 'break-word' }}>{TORTURE_CONTENT.unbroken}</Text>
        <Text color="secondary">{TORTURE_CONTENT.spanish}</Text>
      </SpecimenRow>

      {/* ---- MarkdownView ---- */}
      <SpecimenRow axis="markdownview — heading, list, link, inline code, blockquote (long), table, fenced code">
        <div data-testid="lab-display-markdownview" style={{ minInlineSize: 320, maxInlineSize: 560 }}>
          <MarkdownView source={MARKDOWN_SOURCE} />
        </div>
      </SpecimenRow>

      {/* ---- CodeBlock ---- */}
      <SpecimenRow axis="codeblock — line numbers, highlighted lines, long import line, required copy labels">
        <div data-testid="lab-display-codeblock" style={{ minInlineSize: 320, maxInlineSize: 560 }}>
          <CodeBlock
            code={CODE_SAMPLE}
            language="typescript"
            showLineNumbers
            highlightLines={[3]}
            copyLabel="Copy code"
            copiedLabel="Copied"
            title="quarterly-reconciliation-summary.ts"
          />
        </div>
      </SpecimenRow>

      {/* ---- Image ---- */}
      <SpecimenRow axis="image — radius variants, bordered, deterministic offline placeholder">
        <span data-testid="lab-display-image" style={{ display: 'inline-flex' }}>
          <Image src={PLACEHOLDER_IMAGE_SRC} alt="Reviewer photo" radius="lg" bordered width={120} height={120} />
        </span>
        <Image src={PLACEHOLDER_IMAGE_SRC} alt="Reviewer photo, square" radius="none" width={120} height={120} />
        <Image src={PLACEHOLDER_IMAGE_SRC} alt="Reviewer photo, circular" radius="full" width={120} height={120} />
        {/* Deliberately malformed data: URI — fails to decode with zero network
            dependency, so the error/fallback path is exercised deterministically
            offline instead of depending on a broken remote URL. */}
        <Image src="data:image/png;base64,broken" alt="Corrupt asset" width={120} height={120} />
      </SpecimenRow>
      <SpecimenRow axis="image — long alt text (accessible name torture)">
        <Image src={PLACEHOLDER_IMAGE_SRC} alt={TORTURE_CONTENT.longLabel} width={120} height={120} radius="md" />
      </SpecimenRow>

      {/* ---- Carousel ---- */}
      <SpecimenRow axis="carousel — dots, arrows, three slides (one long-content slide)">
        <div data-testid="lab-display-carousel" style={{ minInlineSize: 320, maxInlineSize: 480, blockSize: 180 }}>
          <Carousel dots arrows>
            <Carousel.Item backgroundColor="var(--ds-color-bg-secondary)">
              <Heading level="h4" style={{ margin: 0 }}>
                Quarterly reconciliation
              </Heading>
            </Carousel.Item>
            <Carousel.Item backgroundColor="var(--ds-color-bg-tertiary)" align="start" justify="center">
              <Text style={{ margin: 0, maxInlineSize: 320 }}>{TORTURE_CONTENT.longParagraph}</Text>
            </Carousel.Item>
            <Carousel.Item backgroundColor="var(--ds-color-bg-elevated)">
              <Text style={{ margin: 0 }}>Slide 3</Text>
            </Carousel.Item>
          </Carousel>
        </div>
      </SpecimenRow>

      {/* ---- QRCode ---- */}
      <SpecimenRow axis="qrcode — status, error correction, short vs. long encoded value">
        <span data-testid="lab-display-qrcode" style={{ display: 'inline-flex' }}>
          <QRCode value="https://example.org/verify/8f3a2b91" errorLevel="H" />
        </span>
        <QRCode value="https://example.org/verify/8f3a2b91" status="expired" />
        {/* Long-content case: QR density is content-length-dependent, unlike most
            other families here — a much longer encoded value is the family's
            actual torture axis, held at the SAME `size` as the short specimen. */}
        <QRCode
          value={`https://example.org/verify/session/8f3a2b91-4c7e-91af-2d6e-7b3c9e1a5f02?ref=${TORTURE_CONTENT.unbroken}`}
          errorLevel="H"
        />
      </SpecimenRow>

      {/* ---- Composition vignette ---- */}
      {/* Wires MarkdownView's `slots.code` override to a live CodeBlock, which
          is the documented reason that slot exists (MarkdownView hardcodes no
          copy strings of its own) — the realistic pairing of this whole group,
          not a synthetic combination. */}
      <Vignette label="documentation panel — markdown with a live CodeBlock slot">
        <div style={{ maxInlineSize: 560 }}>
          <MarkdownView
            source={'### Usage\n\nCall `summarize` with the quarter’s ledger records:\n\n```ts\nsummarize(records)\n```'}
            slots={{
              code: ({ code, language }) => (
                <CodeBlock code={code} language={language} copyLabel="Copy code" copiedLabel="Copied" />
              ),
            }}
          />
        </div>
      </Vignette>
    </SceneFrame>
  );
}
