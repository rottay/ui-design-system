/**
 * Tone-axis contract test (design 2.8, TAX-SIZE-TONE) -- proves the "single
 * authority" law rather than asserting it in a doc comment: every tone-
 * bearing primitive must resolve its `tone` prop THROUGH the kernel
 * {@link TONE_TO_VARIANT} map, not through an independently hand-rolled copy
 * that could silently drift from it.
 *
 * Three resolution shapes are legal and all are asserted here:
 * - Direct engine read: Badge/Tag/Avatar carry no bridge constant. Their
 *   classic, modern and rustic engines index `TONE_TO_VARIANT` per render,
 *   so there is no object to compare by reference -- the law is proven on
 *   the rendered output instead: for every tone a component accepts, on
 *   every stable engine, the root element equals the one rendered for the
 *   internal color-token key `TONE_TO_VARIANT` names for that tone, the
 *   engines that stamp `data-variant` stamp exactly that key, and no two
 *   tones collapse onto one rendering.
 * - Direct identity: Callout/Alert's internal color-token vocabulary is a
 *   strict subset of `TONE_TO_VARIANT`'s spelling, so their bridge constants
 *   are literally `= TONE_TO_VARIANT` (same object reference) -- proven with
 *   `toBe`, which also means each of these bindings still carries the full
 *   six-key runtime object even where its static type narrows the key set
 *   (e.g. `CalloutTone` excludes `'neutral'`/`'primary'`); that is an
 *   intentional consequence of the non-literal-source assignment documented
 *   on each contract file, not a leak.
 * - Documented divergence: Progress's unthemed key is spelled `'normal'`,
 *   not `'default'`, so it cannot derive from the shared object -- its
 *   bridge is asserted key-by-key against `TONE_TO_VARIANT` to prove the
 *   divergence is confined to exactly the `neutral` key and nothing else.
 *
 * A future tone-bearing primitive that hand-rolls a parallel `neutral:
 * 'default', ...` map instead of importing `TONE_TO_VARIANT` (or importing
 * it and re-typing this test to cover the new export) would not be caught
 * by this file automatically -- unlike the size axis, tone has no
 * TS-program census (the vocabulary is one fixed six-member union, not an
 * open string space), so the enumeration below is the census.
 */
import { createElement, type ReactElement } from 'react';
import { describe, expect, it } from 'vitest';

import type { Tone, Variant } from '..';
import { TONE_TO_VARIANT } from '..';
import { Avatar } from '@/components/primitives/display/avatar';
import { Badge } from '@/components/primitives/display/badge';
import { Tag } from '@/components/primitives/display/tag';
import { TONE_TO_CALLOUT_VARIANT } from '@/components/primitives/display/callout/contracts';
import { TONE_TO_ALERT_TYPE } from '@/components/primitives/feedback/alert/contracts';
import { TONE_TO_PROGRESS_STATUS } from '@/components/primitives/feedback/progress/contracts';
import { renderWithEngine, STABLE_ENGINES, type StableEngineName } from '@tests/support/engine';

const ALL_TONES: readonly Tone[] = ['neutral', 'primary', 'success', 'warning', 'danger', 'info'];

const DIRECT_IDENTITY_BRIDGES = [
  ['Callout', TONE_TO_CALLOUT_VARIANT],
  ['Alert', TONE_TO_ALERT_TYPE],
] as const;

const TONES_WITHOUT_INFO = ALL_TONES.filter(
  (tone): tone is Exclude<Tone, 'info'> => tone !== 'info',
);
const LABEL = 'Tone';
const AVATAR_NAME = 'Tone Axis';
const AVATAR_INITIALS = 'TA';

interface ToneAxisSubject {
  readonly tones: readonly Tone[];
  readonly visibleText: string;
  readonly withTone: (tone: Tone) => ReactElement;
  readonly withVariant: (variant: Variant) => ReactElement;
}

const ENGINE_RESOLVED_SUBJECTS: Record<'Badge' | 'Tag' | 'Avatar', ToneAxisSubject> = {
  Badge: {
    tones: ALL_TONES,
    visibleText: LABEL,
    withTone: (tone) => createElement(Badge, { tone }, LABEL),
    withVariant: (variant) => createElement(Badge, { variant }, LABEL),
  },
  Tag: {
    tones: TONES_WITHOUT_INFO,
    visibleText: LABEL,
    withTone: (tone) => createElement(Tag, { tone: tone as Exclude<Tone, 'info'> }, LABEL),
    withVariant: (variant) => createElement(Tag, { variant }, LABEL),
  },
  Avatar: {
    tones: TONES_WITHOUT_INFO,
    visibleText: AVATAR_INITIALS,
    withTone: (tone) => createElement(Avatar, { tone: tone as Exclude<Tone, 'info'>, name: AVATAR_NAME }),
    withVariant: (variant) => createElement(Avatar, { variant, name: AVATAR_NAME }),
  },
};

const ENGINE_RESOLVED_CASES = (
  Object.keys(ENGINE_RESOLVED_SUBJECTS) as (keyof typeof ENGINE_RESOLVED_SUBJECTS)[]
).flatMap((component) => STABLE_ENGINES.map((engine) => [component, engine] as const));

const STAMPING_ENGINES: readonly StableEngineName[] = ['modern', 'rustic'];

async function settledRoot(
  element: ReactElement,
  engine: StableEngineName,
  visibleText: string,
): Promise<{ html: string; stamp: string | null }> {
  const view = renderWithEngine(element, engine);
  await view.findByText(visibleText);
  const root = view.container.firstElementChild;
  const html = root ? (root.cloneNode(false) as Element).outerHTML : '';
  const stamp = view.container.querySelector('[data-variant]')?.getAttribute('data-variant') ?? null;
  view.unmount();
  return { html, stamp };
}

describe('Tone axis contract: TONE_TO_VARIANT is the single resolution authority', () => {
  it('defines every Tone member exactly once, with the documented internal spelling', () => {
    expect(Object.keys(TONE_TO_VARIANT).sort()).toEqual([...ALL_TONES].sort());
    expect(TONE_TO_VARIANT.neutral).toBe('default');
    expect(TONE_TO_VARIANT.primary).toBe('primary');
    expect(TONE_TO_VARIANT.success).toBe('success');
    expect(TONE_TO_VARIANT.warning).toBe('warning');
    expect(TONE_TO_VARIANT.danger).toBe('error');
    expect(TONE_TO_VARIANT.info).toBe('info');
  });

  it.each(DIRECT_IDENTITY_BRIDGES)(
    '%s: its TONE_TO_* bridge is the exact TONE_TO_VARIANT object (no parallel authority)',
    (_component, bridge) => {
      expect(bridge).toBe(TONE_TO_VARIANT);
    },
  );

  it.each(ENGINE_RESOLVED_CASES)(
    '%s on %s: every accepted tone renders the color-token key TONE_TO_VARIANT names for it',
    async (component, engine) => {
      const subject = ENGINE_RESOLVED_SUBJECTS[component];
      const rendered = new Set<string>();

      for (const tone of subject.tones) {
        const key = TONE_TO_VARIANT[tone];
        const fromTone = await settledRoot(subject.withTone(tone), engine, subject.visibleText);
        rendered.add(fromTone.html);

        if (STAMPING_ENGINES.includes(engine)) {
          expect(fromTone.stamp, `${component}/${engine} tone=${tone}`).toBe(key);
        }
        if (key !== 'info') {
          const fromKey = await settledRoot(subject.withVariant(key), engine, subject.visibleText);
          expect(fromTone.html, `${component}/${engine} tone=${tone}`).toBe(fromKey.html);
        } else {
          expect(fromTone.html, `${component}/${engine} tone=${tone}`).toContain(key);
        }
      }

      expect(rendered.size).toBe(subject.tones.length);
    },
  );

  it('Progress: TONE_TO_PROGRESS_STATUS resolves through TONE_TO_VARIANT with exactly one documented divergence (neutral -> "normal", not "default")', () => {
    expect(TONE_TO_PROGRESS_STATUS.success).toBe(TONE_TO_VARIANT.success);
    expect(TONE_TO_PROGRESS_STATUS.danger).toBe(TONE_TO_VARIANT.danger);
    expect(TONE_TO_PROGRESS_STATUS.neutral).toBe('normal');
    expect(TONE_TO_PROGRESS_STATUS.neutral).not.toBe(TONE_TO_VARIANT.neutral);
    // Progress's vocabulary is a curated subset (no primary/warning/info color tokens) --
    // asserting the exact key set catches an accidental widening back toward full `Tone`.
    expect(Object.keys(TONE_TO_PROGRESS_STATUS).sort()).toEqual(['danger', 'neutral', 'success']);
  });

  it('every key actually present on every bridge object is a real Tone member (no invented vocabulary)', () => {
    const bridges = [
      TONE_TO_CALLOUT_VARIANT,
      TONE_TO_ALERT_TYPE,
      TONE_TO_PROGRESS_STATUS,
    ];
    for (const bridge of bridges) {
      for (const key of Object.keys(bridge)) {
        expect(ALL_TONES).toContain(key);
      }
    }
  });
});
