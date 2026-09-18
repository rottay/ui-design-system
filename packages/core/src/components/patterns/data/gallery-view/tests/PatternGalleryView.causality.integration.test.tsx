/**
 * The gallery-view family in a real browser (WO-FAM-08 B7).
 *
 * The family has NO deriver: every name its skin reads already has a producer,
 * so `readWithoutProducer` is 0 and there is nothing for a `chrome/gallery-view`
 * to emit. What this suite proves is the other half of §1.6: the decisions that
 * reach the family's own paint through the cascade roots, one probe per
 * decision with a negative control, plus the three layout channels the cut
 * introduced -- read back both at their resting declaration (the producer is
 * real, not a fallback) and at a stamped instance value.
 */
import React from 'react';
import { Writable } from 'node:stream';
import { prerenderToNodeStream } from 'react-dom/static';
import { describe, expect, it } from 'vitest';

import { DesignSystemProvider } from '@/infrastructure/runtime/bootstrap';
import { firstPartyEngineVisual } from '@/infrastructure/compilers/runtime/theme';
import type { TenantConfig } from '@/foundation/contracts';
import { PatternGalleryView } from '../presentation/gallery';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

interface Photo {
  id: string;
  image: string;
  title: string;
}

const PHOTOS: Photo[] = [
  { id: 'a', image: 'https://example.test/a.png', title: 'Harbour at dawn' },
  { id: 'b', image: 'https://example.test/b.png', title: 'Rooftop panel' },
  { id: 'c', image: '', title: 'Missing preview' },
];

const TENANT: TenantConfig = {
  slug: 'gallery-view-causality',
  name: 'Gallery view causality',
  theme: 'base',
  locale: 'en',
  fallbackLocale: 'en',
  plan: 'enterprise',
  features: [],
  branding: { companyName: 'Gallery view causality' },
};

interface MarkupRequest {
  readonly data?: readonly Photo[];
  readonly gap?: number | string;
  readonly aspectRatio?: string;
  readonly loading?: boolean;
}

/** The family's own server markup, kept whole as the list-toolbar precedent keeps it. */
async function serverMarkup(request: MarkupRequest = {}): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <DesignSystemProvider
      tenantConfig={TENANT}
      forceEngine="modern"
      engineVisual={firstPartyEngineVisual('rottay', 'modern')}
      skipCssLoading
      ssrViewport="desktop"
    >
      <PatternGalleryView<Photo>
        data={[...(request.data ?? PHOTOS)]}
        imageField="image"
        captionField="title"
        rowKey="id"
        selectable
        selectedKeys={['a']}
        loading={request.loading ?? false}
        {...(request.gap === undefined ? {} : { gap: request.gap })}
        {...(request.aspectRatio === undefined ? {} : { aspectRatio: request.aspectRatio })}
      />
    </DesignSystemProvider>,
  );
  let html = '';
  await new Promise<void>((resolve, reject) => {
    prelude
      .pipe(
        new Writable({
          write(chunk, _encoding, done) {
            html += chunk.toString();
            done();
          },
        }),
      )
      .on('finish', () => resolve())
      .on('error', reject);
  });
  return html;
}

const gallery = await serverMarkup();
const empty = await serverMarkup({ data: [] });
const loading = await serverMarkup({ loading: true });
const markup = `<div id="gallery" style="inline-size:64rem">${gallery}</div>`
  + `<div id="empty" style="inline-size:64rem">${empty}</div>`;
/** The same gallery, stating its own gap and media ratio: the per-instance stamp. */
const stampedMarkup = `<div id="stamped" style="inline-size:64rem">`
  + `${await serverMarkup({ gap: 48, aspectRatio: '16/9' })}</div>`;

/* The family root is addressed through its OWN class: `Box` stamps
   `data-part='root'` too, so a bare `#gallery [data-part='root']` would match
   the composed Stack's Box first and measure the wrong element. */
const ROOT = "#gallery .ds-pattern-gallery-view[data-part='root']";
const CARD = "#gallery .ds-gallery-card[data-part='card']";
const FRAME = "#gallery [data-part='image-frame']";
const PLACEHOLDER = "#gallery [data-part='image-placeholder']";
const CAPTION = "#gallery .ds-gallery-card [data-part='caption']";
const CAPTION_TEXT = '#gallery .ds-gallery-view__caption-text';
/* The SAME node, reached through the part the composed `Text` forwards --
   which is how the skin keys the caption line, and what the axe node identity
   below already proves the loaded caption carries. */
const CAPTION_TEXT_PART = "#gallery .ds-gallery-card [data-part='caption-text']";
/* The UNSELECTED card's overlay: a checked checkbox is always visible
   (`:has(input:checked)`), so the selected card's overlay could never measure
   the hover reveal. */
const UNSELECTED = "#gallery .ds-gallery-card[data-selected='false']";
const OVERLAY = `${UNSELECTED} .ds-gallery-checkbox`;
const EMPTY_ROOT = "#empty .ds-pattern-gallery-view[data-part='root']";
const EMPTY_TEXT = "#empty [data-part='empty-state']";

describeCausality({
  family: 'gallery-view',
  markup,
  targets: [
    // A selected card is the family's own seeded signal, on its border and its
    // ring; the focus ring is the second.
    { id: 'selectedInk', selector: CARD, property: 'border-top-color' },
    { id: 'selectedRing', selector: CARD, property: 'box-shadow' },
    {
      id: 'focusInk',
      selector: CARD,
      property: 'outline-color',
      attributes: { 'data-state': 'focus-visible' },
    },
    {
      id: 'focusRing',
      selector: CARD,
      property: 'outline-width',
      attributes: { 'data-state': 'focus-visible' },
    },
    // The card and the overlay close on two rungs of the same radius ramp.
    { id: 'cardCorner', selector: CARD, property: 'border-top-left-radius' },
    { id: 'overlayCorner', selector: OVERLAY, property: 'border-top-left-radius' },
    { id: 'emptyCorner', selector: EMPTY_ROOT, property: 'border-top-left-radius' },
    // The selection overlay is the family's only elevated part.
    { id: 'overlayShadow', selector: OVERLAY, property: 'box-shadow' },
    // Rhythm: the caption strip, the empty frame and the gallery's own gap.
    { id: 'captionPad', selector: CAPTION, property: 'padding-top' },
    { id: 'emptyPad', selector: EMPTY_ROOT, property: 'padding-top' },
    { id: 'galleryGap', selector: ROOT, property: 'column-gap' },
    // The caption line is the family's own text.
    { id: 'captionType', selector: CAPTION_TEXT, property: 'font-size' },
    // The neutral the seed must not reach.
    { id: 'cardGround', selector: CARD, property: 'background-color' },
  ],
  decisions: {
    // The selected card's border, its ring and the focus ink all resolve from
    // the seeded ramp; the card's own ground is the neutral surface, and it is
    // the control that proves the seed stopped where it should.
    'palette.seeds': {
      value: { primary: '#2F6B9A' },
      moves: ['selectedInk', 'selectedRing', 'focusInk'],
      holds: 'cardGround',
      in: VERTICALS,
    },
    // Three corners on the same ramp: the card, the overlay and the empty frame.
    'shape.radius-scale': {
      value: 1.2,
      moves: ['cardCorner', 'overlayCorner', 'emptyCorner'],
      holds: 'cardGround',
      in: VERTICALS,
    },
    // The overlay is the only part that reads the elevation ramp.
    'surfaces.elevation-posture': {
      value: 'elevated',
      moves: ['overlayShadow'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    // A card is a real tab stop, so the focus signature is its own ring width.
    'states.focus-style': {
      value: 'glow',
      moves: ['focusRing'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    // The caption strip, the empty frame and the gallery's own gap ride the
    // density-scaled spacing ramp; the gap only reaches the theme BECAUSE the
    // cut stopped the prop default from stamping it inline on every render.
    'density.mode': {
      value: 'spacious',
      moves: ['captionPad', 'emptyPad', 'galleryGap'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
    // The caption is the family's own text.
    'typography.scale': {
      value: 1.08,
      moves: ['captionType'],
      holds: 'cardCorner',
      in: VERTICALS,
    },
  },
});

/**
 * Measured debt, pinned by node IDENTITY rather than by count: a repaired node,
 * a new node and a same-count swap all go red and must be re-adjudicated.
 *
 * The one failing scope was contrast on the caption line in bithire dark: the
 * caption strip grounds itself on `--ds-color-bg-primary` and inks itself with
 * `--ds-color-text-primary`, and that vertical's dark pair did not clear the
 * ratio over a media card. It was a token-pair finding, not a family one, and
 * the token pair moved: the dark block re-derives its own canvas ground instead
 * of inheriting the light body's, so all three caption rows DRAINED. Dropped by
 * identity, not waived; a scope with no entry is a scope that must stay clean,
 * so a relapse reddens here.
 */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {};

describe('gallery-view causality surface', () => {
  it('serves the anatomy every probe reads', () => {
    expect(gallery).toContain('data-part="card"');
    expect(gallery).toContain('data-part="image-frame"');
    expect(gallery).toContain('data-part="image-placeholder"');
    expect(gallery).toContain('data-part="caption"');
    expect(gallery).toContain('data-part="checkbox"');
    expect(empty).toContain('data-part="empty-state"');
    // The card is a stateful part decided by the kernel: at rest it carries NO
    // `data-state`, so `[data-state]` never matches a resting card and the
    // skin's eight paired arms fall through to the platform pseudo-class.
    expect(gallery).not.toContain('data-part="card" data-state');
    // A gallery that states no layout number stamps NO layout channel.
    expect(gallery).not.toContain('--ds-gallery-view-columns');
    expect(gallery).not.toContain('--ds-gallery-view-gap');
    expect(gallery).not.toContain('--ds-gallery-view-aspect-ratio');
    expect(stampedMarkup).toContain('--ds-gallery-view-gap:48px');
    expect(stampedMarkup).toContain('--ds-gallery-view-aspect-ratio:16/9');
    // Nothing else travels inline: the six paint sites this cut drained would
    // all have shown up here.
    expect(gallery).not.toContain('aspect-ratio:');
    expect(gallery).not.toContain('display:grid');
  });

  /**
   * The loading state is the gallery's OWN anatomy under the shared renderer,
   * not a hand-built stand-in with parts nothing else stamps.
   */
  it('derives the loading state from the family anatomy', () => {
    expect(loading).toContain('ds-skeleton-anatomy');
    expect(loading).toContain('data-part="source"');
    expect(loading).toContain('ds-pattern-gallery-view');
    expect(loading).toContain('data-loading="true"');
    expect(loading).toContain('data-part="card"');
    expect(loading).toContain('data-part="image-frame"');
    expect(loading).toContain('data-part="caption-text"');
    // And no hand-made skeleton survives beside it.
    expect(loading).not.toContain('skeleton-card');
    expect(loading).not.toContain('skeleton-caption');
    expect(loading).not.toContain('ds-gallery-view__skeleton');
  });

  /**
   * The caption's rhythm lives on the STRIP and nowhere else. The line inside
   * it must carry no padding of its own: an earlier cut of this lot consumed
   * the `caption-text` part by adding it to the strip's padding rule, which
   * gave every loaded caption a second copy of the block padding and a 10px
   * inline indent inside an already-padded strip.
   */
  it('keeps the caption rhythm on the strip and paints no padding on the line', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'stripPadTop', selector: CAPTION, property: 'padding-top' },
        { id: 'stripPadLeft', selector: CAPTION, property: 'padding-left' },
        { id: 'linePadTop', selector: CAPTION_TEXT_PART, property: 'padding-top' },
        { id: 'linePadBottom', selector: CAPTION_TEXT_PART, property: 'padding-bottom' },
        { id: 'linePadLeft', selector: CAPTION_TEXT_PART, property: 'padding-left' },
        { id: 'linePadRight', selector: CAPTION_TEXT_PART, property: 'padding-right' },
        // The re-keyed rule still reaches the loaded line through the part, so
        // the ellipsis contract is not paid for with a second indent.
        { id: 'lineOverflow', selector: CAPTION_TEXT_PART, property: 'text-overflow' },
        { id: 'lineDisplay', selector: CAPTION_TEXT_PART, property: 'display' },
        { id: 'lineOverflowBox', selector: CAPTION_TEXT_PART, property: 'overflow-x' },
        // MEASURED RESIDUE, pinned so a repair goes red and is re-adjudicated:
        // the skin asks for `white-space: nowrap`, but `Text` resolves its
        // `wrap` craft prop to an INLINE `text-wrap: pretty`, which outranks
        // every skin rule. The caption therefore wraps instead of ellipsing.
        // Unchanged by this cut (the class-keyed rule measured the same) and
        // owned by the typography primitive, not by this family.
        { id: 'lineWrap', selector: CAPTION_TEXT_PART, property: 'white-space' },
      ],
    });
    const r = readings.base!;
    // The strip pays the rhythm once.
    expect(Number.parseFloat(r.stripPadTop)).toBeGreaterThan(0);
    expect(r.stripPadLeft).toBe('10px');
    // The line pays nothing.
    expect(r.linePadTop).toBe('0px');
    expect(r.linePadBottom).toBe('0px');
    expect(r.linePadLeft).toBe('0px');
    expect(r.linePadRight).toBe('0px');
    // And the part-keyed rule is the one painting the line.
    expect(r.lineOverflow).toBe('ellipsis');
    expect(r.lineDisplay).toBe('block');
    expect(r.lineOverflowBox).toBe('hidden');
    // The residue above, pinned as measured rather than as promised.
    expect(r.lineWrap).toBe('normal');
  }, 120_000);

  /**
   * The three layout channels the cut introduced, read back twice: once where
   * the skin's own declaration is the producer (so the read resolves to a value
   * a theme can move, not to a `var()` fallback nobody writes), and once where
   * the instance stamp outranks it.
   */
  it('resolves all three layout channels from a real producer, and lets the stamp outrank them', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup: `${markup}${stampedMarkup}`,
      arms: { base: {}, spacious: { 'density.mode': 'spacious' } },
      targets: [
        { id: 'restingColumns', selector: ROOT, property: '--ds-gallery-view-columns' },
        { id: 'restingRatio', selector: ROOT, property: '--ds-gallery-view-aspect-ratio' },
        { id: 'tracks', selector: ROOT, property: 'grid-template-columns' },
        { id: 'themedGap', selector: ROOT, property: 'column-gap' },
        // The media ratio reaches BOTH the frame and the placeholder that
        // stands in for a missing image, so a card without a preview keeps the
        // same footprint as one with it.
        { id: 'frameRatio', selector: FRAME, property: 'aspect-ratio' },
        { id: 'placeholderRatio', selector: PLACEHOLDER, property: 'aspect-ratio' },
        {
          id: 'stampedGap',
          selector: "#stamped .ds-pattern-gallery-view[data-part='root']",
          property: 'column-gap',
        },
        { id: 'stampedRatio', selector: "#stamped [data-part='image-frame']", property: 'aspect-ratio' },
        // The empty branch is deliberately NOT a grid: one centered message.
        { id: 'emptyDisplay', selector: EMPTY_ROOT, property: 'display' },
      ],
    });
    const base = readings.base!;
    const spacious = readings.spacious!;
    // The producers are declarations, not fallbacks: both reads resolve.
    expect(base.restingColumns).toContain('auto-fill');
    expect(base.restingColumns).toContain('100%');
    expect(base.restingRatio.trim()).toBe('1');
    // Rounded to the computed spelling by the engine, not by the family.
    // And they reach the paint.
    expect(base.tracks.split(' ').length).toBeGreaterThan(1);
    expect(base.frameRatio).toBe('1 / 1');
    expect(base.placeholderRatio).toBe(base.frameRatio);
    // The theme's gallery moves with density; the caller's numbers win in both.
    expect(spacious.themedGap).not.toBe(base.themedGap);
    expect(base.stampedGap).toBe('48px');
    expect(spacious.stampedGap).toBe('48px');
    expect(base.stampedRatio).toBe('16 / 9');
    expect(base.emptyDisplay).not.toBe('grid');
  }, 120_000);

  /**
   * The selection overlay anchors on the INLINE axis, so it lands in the
   * inline-start corner of the card in both reading directions -- which is what
   * the logical insets promise and what a physical `left` would break.
   */
  it('lands the selection overlay on the inline-start corner in both directions', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        // The same card the overlay belongs to, or the two rects are measured
        // on different cards and the reading means nothing.
        { id: 'cardLeftLtr', selector: UNSELECTED, property: '@rect.left' },
        { id: 'overlayLeftLtr', selector: OVERLAY, property: '@rect.left' },
        { id: 'cardRightRtl', selector: UNSELECTED, property: '@rect.right', dir: 'rtl' },
        { id: 'overlayRightRtl', selector: OVERLAY, property: '@rect.right', dir: 'rtl' },
      ],
    });
    const r = readings.base!;
    expect(Number(r.overlayLeftLtr) - Number(r.cardLeftLtr)).toBeGreaterThan(0);
    expect(Number(r.overlayLeftLtr) - Number(r.cardLeftLtr)).toBeLessThan(32);
    expect(Number(r.cardRightRtl) - Number(r.overlayRightRtl)).toBeGreaterThan(0);
    expect(Number(r.cardRightRtl) - Number(r.overlayRightRtl)).toBeLessThan(32);
  }, 120_000);

  /**
   * State is decided once (F-37). The kernel's token and the platform
   * pseudo-class are ONE decision with a fallback, so the same paint arrives
   * through `[data-state~='hovered']` on a card the pointer never touched --
   * which is what a test can drive and a hover cannot.
   */
  it('paints the hover arm from the kernel state, not only from :hover', async () => {
    const readings = await measureArms({
      vertical: 'rottay',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'restingLift', selector: UNSELECTED, property: 'transform' },
        {
          id: 'statedLift',
          selector: UNSELECTED,
          property: 'transform',
          attributes: { 'data-state': 'hovered' },
        },
        {
          id: 'restingOverlay',
          selector: OVERLAY,
          property: 'opacity',
        },
        {
          id: 'statedOverlay',
          selector: OVERLAY,
          property: 'opacity',
          attributes: { 'data-state': 'hovered' },
          attributesOn: UNSELECTED,
        },
      ],
    });
    const r = readings.base!;
    // A resting card is flat and its overlay is hidden.
    expect(r.restingLift).toBe('none');
    expect(r.restingOverlay).toBe('0');
    // The kernel's own token lifts it and reveals the overlay.
    expect(r.statedLift).not.toBe(r.restingLift);
    expect(r.statedOverlay).toBe('1');
  }, 120_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 300_000);
});
