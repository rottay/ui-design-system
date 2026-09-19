/**
 * Record, WO-FAM-10 sub-lot F.
 *
 * What this suite owns, and the suites beside it do not: the DOM contract the
 * family cut changed. The runtime `span` prop is a `data-span` stamp whose
 * geometry rides the `--ds-record-field-span` channel instead of an inline
 * `grid-column` (one skin arm, so the published numeric domain survives whole
 * — S19-F02), the caller's `columns`
 * prop rides the one legal `--ds-*` channel while the skin authors the
 * default, the loading states are built from the anatomy by the shared
 * renderer instead of hand-made Skeleton pairs, and the hover/press/focus
 * paint is the shared kernel's decision read off `data-state` — on the field
 * root and on the surface-owned linked-value wrapper, because the composed
 * app Link admits no `data-*` attributes. The link's keyboard ring is the one
 * exception: it belongs on the anchor, the element focus actually reaches
 * (S19-F03).
 */
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { RecordField } from '../field';
import { RecordFieldGrid } from '../field-grid';
import { RecordSummaryStrip } from '../summary-strip';
import { renderWithEngine } from '@tests/support/engine';

const WAIT_TIMEOUT = 2000;

const SKIN = readFileSync(
  resolve(process.cwd(), 'src/foundation/tokens/css/presentation/components/skin/record/index.css'),
  'utf8'
).replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Loads the field's own grid-column rules, verbatim from the skin, so the
 * resolved geometry can be READ BACK instead of inferred from the stamp the
 * TSX wrote. Every rule the skin declares for the span is loaded, so a finite
 * list of value-arms is measured exactly as a browser would apply it.
 */
function loadSpanRules(): HTMLStyleElement {
  const rules = SKIN.match(
    /\.ds-structure\.ds-record\[data-part='field'\]\[data-span[^{}]*\{[^{}]*grid-column:[^{}]*\}/g,
  );
  if (!rules?.length) throw new Error('missing the record field span rules in the skin');
  const style = document.createElement('style');
  style.textContent = rules.join('\n');
  document.head.appendChild(style);
  return style;
}

/**
 * Loads the record link's keyboard-ring rule, verbatim from the skin. The
 * forced-colors re-expression is excluded: injected bare it would sort last
 * and answer for the token-controlled rule under test.
 */
function loadLinkFocusRule(): HTMLStyleElement {
  const rules = (
    SKIN.match(/\.ds-structure\.ds-record\[data-part='field'\][^{}]*field-link[^{}]*\{[^{}]*outline:[^{}]*\}/g) ?? []
  ).filter((rule) => !rule.includes('Highlight'));
  if (rules.length !== 1) {
    throw new Error(`expected exactly 1 record-link focus ring rule, found ${rules.length}`);
  }
  const style = document.createElement('style');
  style.textContent = rules[0];
  document.head.appendChild(style);
  return style;
}

async function waitForPart(container: HTMLElement, part: string): Promise<HTMLElement> {
  await waitFor(
    () => {
      if (!container.querySelector(`[data-part="${part}"]`)) {
        throw new Error(`expected [data-part="${part}"] in <container>`);
      }
    },
    { timeout: WAIT_TIMEOUT },
  );
  return container.querySelector(`[data-part="${part}"]`) as HTMLElement;
}

describe('Record (WO-FAM-10 cut)', () => {
  it('stamps the runtime span as data-span and writes no inline grid-column', async () => {
    const { container, unmount } = renderWithEngine(
      <RecordFieldGrid>
        <RecordField label="Name" value="Ada Lovelace" />
        <RecordField label="Bio" value="Mathematician" span={2} />
        <RecordField label="Ref" value="REC-1" span={3} />
      </RecordFieldGrid>,
      'modern',
    );

    await waitForPart(container, 'field-grid');
    const fields = container.querySelectorAll("[data-part='field']");
    expect(fields.length).toBe(3);
    expect(fields[0].getAttribute('data-span')).toBe('1');
    expect(fields[1].getAttribute('data-span')).toBe('2');
    expect(fields[2].getAttribute('data-span')).toBe('3');
    for (const field of Array.from(fields)) {
      expect(field.getAttribute('style') ?? '').not.toContain('grid-column');
      expect(field.getAttribute('style') ?? '').not.toContain('gridColumn');
    }
    unmount();
  });

  it('keeps the published numeric span domain whole, past the old finite arms (S19-F02)', async () => {
    const style = loadSpanRules();
    const { container, unmount } = renderWithEngine(
      <RecordFieldGrid columns="repeat(4, 1fr)">
        <RecordField label="Ref" value="REC-1" span={3} />
        <RecordField label="Summary" value="Four tracks wide" span={4} />
        <RecordField label="Ledger" value="Seven tracks wide" span={7} />
      </RecordFieldGrid>,
      'modern',
    );

    await waitForPart(container, 'field-grid');
    const fields = Array.from(container.querySelectorAll("[data-part='field']")) as HTMLElement[];
    // Control: the value the retired arms did cover still resolves, so a
    // stylesheet or runner failure cannot pass for the product defect.
    expect(getComputedStyle(fields[0]).gridColumn).toBe('span 3');
    // The defect: every value past the last arm silently lost its geometry.
    expect(getComputedStyle(fields[1]).gridColumn).toBe('span 4');
    expect(getComputedStyle(fields[2]).gridColumn).toBe('span 7');
    // The span is instance geometry on the ONE legal channel, never paint.
    expect(fields[1].style.getPropertyValue('--ds-record-field-span')).toBe('4');
    expect(fields[1].getAttribute('style') ?? '').not.toContain('grid-column');
    unmount();
    style.remove();
  });

  it('places the record link ring on the anchor keyboard focus actually reaches (S19-F03)', async () => {
    const style = loadLinkFocusRule();
    const { container, unmount } = renderWithEngine(
      <RecordField label="Profile" value="Ada Lovelace" href="/people/ada" />,
      'modern',
    );

    const linkBody = await waitForPart(container, 'field-link-body');
    const anchor = container.querySelector('a.ds-record__field-link') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    // The ring's target must CONTAIN the focusable element: focus bubbles up,
    // never down, so a ring inside the anchor is unreachable by construction.
    expect(anchor.contains(linkBody)).toBe(true);

    anchor.focus();
    expect(document.activeElement).toBe(anchor);
    // The ring's declarations resolve ON the focused anchor. The `outline`
    // shorthand carries `var()`, which this runner does not expand into its
    // longhands, so the two ring declarations it does resolve are the read:
    // an unreached rule leaves both empty, as it did before this correction.
    const ring = getComputedStyle(anchor);
    expect(ring.outlineOffset).toBe('2px');
    expect(ring.borderRadius).toBe('4px');
    unmount();
    style.remove();
  });

  it('writes the grid-columns channel only for a caller override and authors the default in the skin', async () => {
    const { container, unmount } = renderWithEngine(
      <>
        <RecordFieldGrid>
          <RecordField label="Name" value="Ada Lovelace" />
        </RecordFieldGrid>
        <RecordFieldGrid columns="repeat(2, 1fr)">
          <RecordField label="Name" value="Ada Lovelace" />
        </RecordFieldGrid>
      </>,
      'modern',
    );

    const grid = (await waitForPart(container, 'field-grid')) as HTMLElement;
    // Default: the skin authors `--ds-record-field-grid-columns`; the TSX
    // writes nothing. jsdom applies no skin stylesheet, so the authored
    // declaration is asserted at source below, not through computed style.
    expect(grid.getAttribute('style') ?? '').not.toContain('--ds-record-field-grid-columns');

    const grids = container.querySelectorAll("[data-part='field-grid']");
    expect(grids[1].getAttribute('style') ?? '').toContain('--ds-record-field-grid-columns');
    expect(grids[1].getAttribute('style') ?? '').toContain('repeat(2, 1fr)');
    unmount();

    // The ONE producer of the channel is the skin's authored declaration;
    // the grid reads it back and nothing else reads it (an authored
    // declaration is a producer — a deriver statement of it would be a
    // second authority).
    expect(SKIN).toContain('--ds-record-field-grid-columns:');
    expect(SKIN).toContain('grid-template-columns: var(--ds-record-field-grid-columns)');
    expect(SKIN).toContain('repeat(auto-fit, minmax(min(100%, var(--_ds-record-field-measure, 16rem)), 1fr))');
  });

  it('builds the field loading state from the anatomy and keeps a single announcement', async () => {
    const { container, unmount } = renderWithEngine(
      <RecordField label="Reference" value="REC-1" copyValue="REC-1" loading />,
      'modern',
    );

    const field = await waitForPart(container, 'field');
    // The hand-made skeleton pair is gone: no wrapper stamps, no <Skeleton>.
    expect(container.querySelector("[data-part='field-skeleton-label']")).toBeNull();
    expect(container.querySelector("[data-part='field-skeleton-value']")).toBeNull();
    // The anatomy-derived renderer took over: the source subtree carries the
    // real parts inert under bones drawn one per part.
    const skeletonRoot = field.querySelector('.ds-skeleton-anatomy');
    expect(skeletonRoot).not.toBeNull();
    expect(skeletonRoot!.getAttribute('data-part')).toBe('root');
    // The field root keeps the announcement; the skeleton does not re-announce.
    expect(field.getAttribute('aria-busy')).toBe('true');
    expect(skeletonRoot!.getAttribute('aria-busy')).toBeNull();
    expect(field.querySelector("[data-part='field-label']")).not.toBeNull();
    await waitFor(
      () => {
        if (!field.querySelectorAll("[data-part='bone']").length) {
          throw new Error('expected anatomy bones to render');
        }
      },
      { timeout: WAIT_TIMEOUT },
    );
    // The affordance renders inert inside the source layer, so no control
    // acts on placeholder content.
    expect(field.querySelector("[data-part='source']")?.getAttribute('inert')).not.toBeNull();
    unmount();
  });

  it('builds the summary strip loading state from the anatomy', async () => {
    const { container, unmount } = renderWithEngine(
      <RecordSummaryStrip
        loading
        items={[{ label: 'Status', value: 'Active', helper: 'Since yesterday' }]}
      />,
      'modern',
    );

    const strip = await waitForPart(container, 'summary-strip');
    expect(container.querySelector("[data-part='summary-item-skeleton-label']")).toBeNull();
    expect(container.querySelector("[data-part='summary-item-skeleton-value']")).toBeNull();
    const skeletonRoot = strip.querySelector('.ds-skeleton-anatomy');
    expect(skeletonRoot).not.toBeNull();
    expect(strip.getAttribute('aria-busy')).toBe('true');
    expect(skeletonRoot!.getAttribute('aria-busy')).toBeNull();
    expect(strip.querySelector("[data-part='summary-item-label']")).not.toBeNull();
    await waitFor(
      () => {
        if (!strip.querySelectorAll("[data-part='bone']").length) {
          throw new Error('expected anatomy bones to render');
        }
      },
      { timeout: WAIT_TIMEOUT },
    );
    unmount();
  });

  it('decides the field hover and focus-within once, in the kernel, and reads them off data-state', async () => {
    const { container, unmount } = renderWithEngine(
      <RecordField label="Reference" value="REC-1" copyValue="REC-1" />,
      'modern',
    );

    const field = await waitForPart(container, 'field');
    expect(field.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(field);
    await waitFor(() => expect(field.getAttribute('data-state')).toContain('hovered'));

    fireEvent.pointerLeave(field);
    await waitFor(() => expect(field.getAttribute('data-state')).toBeNull());

    // Focus events bubble: focus into the composed copy button reads as the
    // field's focus-within state.
    const copy = await waitFor(() => {
      const found = container.querySelector('button[aria-label="Copy reference"]');
      if (!found) throw new Error('copy button not found');
      return found as HTMLElement;
    });
    fireEvent.focus(copy);
    await waitFor(() => expect(field.getAttribute('data-state')).toContain('focused'));

    fireEvent.blur(copy);
    await waitFor(() => expect(field.getAttribute('data-state')).toBeNull());
    unmount();
  });

  it('decides the linked-value hover and press on the surface-owned wrapper, not through the anchor', async () => {
    const { container, unmount } = renderWithEngine(
      <RecordField label="Profile" value="Ada Lovelace" href="/people/ada" />,
      'modern',
    );

    const linkBody = await waitForPart(container, 'field-link-body');
    expect(linkBody.getAttribute('data-state')).toBeNull();
    // The anchor is a native <a> with the family's class hook and no state of
    // its own; the app-injected Link contract admits no `data-*` attributes,
    // so the state lands on the wrapper.
    const anchor = container.querySelector('a.ds-record__field-link');
    expect(anchor).not.toBeNull();
    expect(anchor!.getAttribute('data-state')).toBeNull();

    fireEvent.pointerEnter(linkBody);
    await waitFor(() => expect(linkBody.getAttribute('data-state')).toContain('hovered'));

    fireEvent.pointerDown(linkBody);
    await waitFor(() => expect(linkBody.getAttribute('data-state')).toContain('pressed'));

    fireEvent.pointerUp(linkBody);
    fireEvent.pointerLeave(linkBody);
    await waitFor(() => expect(linkBody.getAttribute('data-state')).toBeNull());
    unmount();
  });

  it('keeps the copy naming and the link arrow honest under a right-to-left reading', async () => {
    const { container, getByRole, unmount } = renderWithEngine(
      <div dir="rtl">
        <RecordField label="Reference" value="REC-1" copyValue="REC-1" href="/refs/rec-1" />
      </div>,
      'modern',
    );

    // The copy button arrives through a lazily mounted Tooltip, so the name
    // is waited for rather than read on the first frame.
    await waitFor(() => expect(getByRole('button', { name: 'Copy reference' })).toBeTruthy(), {
      timeout: WAIT_TIMEOUT,
    });
    // The arrow mirrors through the skin's [dir='rtl'] rule, not an inline
    // transform of the family's own.
    const icon = await waitForPart(container, 'field-link-icon');
    expect(icon.getAttribute('style') ?? '').not.toContain('scaleX');
    unmount();
  });
});
