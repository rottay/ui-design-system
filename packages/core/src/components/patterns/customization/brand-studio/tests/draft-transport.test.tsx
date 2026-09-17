/**
 * WO-DER-08 acceptance: the studio's draft transport is the governed `Theme`.
 *
 * Fails against the pre-change pattern in three independent ways: `value` did
 * not admit a governed draft, `onChange` emitted the flat read view, and the
 * file export serialized that view — so the flat shape was an AUTHORING
 * surface as well as the lowering's read view, which is the one claim its
 * retirement narrative could not make honestly.
 *
 * Every arm below is compared on what the compile door actually decides:
 * patch, ledger, baseline and compiled output.
 */

import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { DesignSystemProvider } from '../../../../../infrastructure/runtime/bootstrap';
import type { TenantConfig } from '../../../../../foundation/contracts';
import type { FlatTheme } from '../../../../../foundation/contracts/composition/tenants/themes';
import type { Theme } from '../../../../../foundation/contracts/composition/tenants/themes/iso';
import {
  PatternBrandStudio,
  normalizeThemeDraft,
  buildSurfaceVariables,
} from '../index';
import {
  serializeThemeDraft,
  deserializeThemeDraft,
  serializeFlatTheme,
  deserializeFlatTheme,
} from '../runtime/file-export';
import {
  compileThemeIntent,
  draftPreviewThemeIntent,
  projectThemeDraft,
  readThemeDraft,
} from '@/infrastructure/compilers/runtime/theme';

const VERTICAL = 'bithire' as const;
const SLUG = 'draft-transport';

const TEST_TENANT: TenantConfig = {
  slug: SLUG,
  name: 'Draft Transport',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Draft Transport' },
};

/** A draft that authors one governed family and one ungoverned one. */
const FLAT: FlatTheme = {
  id: SLUG,
  name: 'Draft Transport',
  palette: { primaryColor: '#2F5BE8' },
  motion: { intensity: 0.6, hoverScale: 1.01 },
};

/** A draft that authors no governed family at all. */
const BARE: FlatTheme = {
  id: SLUG,
  name: 'Draft Transport',
  palette: { primaryColor: '#2F5BE8' },
};

const roundTrip = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const intentOf = (draft: Theme | FlatTheme) =>
  draftPreviewThemeIntent({ vertical: VERTICAL, slug: SLUG, draft });

function expectSameIntent(actual: Theme | FlatTheme, expected: Theme | FlatTheme): void {
  const a = intentOf(actual);
  const b = intentOf(expected);
  expect(a.patch).toEqual(b.patch);
  expect(a.ledger).toEqual(b.ledger);
  expect(a.baseline).toEqual(b.baseline);
  expect(compileThemeIntent(a).compiled).toEqual(compileThemeIntent(b).compiled);
}

describe('WO-DER-08 studio draft transport', () => {
  it('admits the governed draft, its JSON round trip and the superseded flat arm as one compile', () => {
    const governed = normalizeThemeDraft(FLAT);
    // The governed arm is genuinely governed: the wrapper is what the door
    // discriminates on, and JSON keeps the vocabulary even when it drops an
    // `undefined` disposition.
    expect(Object.keys(roundTrip(governed).motion)).toEqual(['value']);
    expectSameIntent(governed, FLAT);
    expectSameIntent(roundTrip(governed), FLAT);
  });

  it('the file export round-trips a governed draft back into the same compile', () => {
    const governed = normalizeThemeDraft(FLAT);
    const restored = deserializeThemeDraft(serializeThemeDraft(governed));
    expect(restored).toEqual(roundTrip(governed));
    expectSameIntent(restored, governed);
  });

  it('the file import shares ONE discriminant with the compile door', () => {
    // A file written by the superseded flat exporter still imports, because the
    // reader is the door's own -- not a second, export-local test for a key.
    const fromFlatFile = deserializeThemeDraft(serializeFlatTheme(FLAT));
    expect(Object.keys(roundTrip(fromFlatFile).motion)).toEqual(['value']);
    expectSameIntent(fromFlatFile, normalizeThemeDraft(FLAT));
    // And the superseded reader still parses what it always parsed.
    expect(deserializeFlatTheme(serializeFlatTheme(FLAT))).toEqual(FLAT);
  });

  it('preserves the intake inactive-family omission, charts exception included', () => {
    const view = projectThemeDraft(normalizeThemeDraft(BARE));
    // `charts` unwraps to `{}` because its writer reads sub-keys; the other
    // four families are OMITTED so no writer paints a declined capability.
    expect(view.charts).toEqual({});
    expect('motion' in view).toBe(false);
    expect('recipes' in view).toBe(false);
    expect('expressive' in view).toBe(false);
    expect('responsive' in view).toBe(false);
  });

  it('carries a withheld family disposition through a projection and back', () => {
    const withheld = {
      ...normalizeThemeDraft(BARE),
      recipes: { value: undefined, disposition: 'pending-selection' },
    } as unknown as Theme;
    const relifted = readThemeDraft(projectThemeDraft(withheld), withheld);
    expect(relifted.recipes.disposition).toBe('pending-selection');
    // Without the carry the reason is rewritten as the lift's own default.
    expect(readThemeDraft(projectThemeDraft(withheld)).recipes.disposition).toBe(
      'not-authored',
    );
  });

  it('the carry never outranks an edit to a family the draft had withheld', () => {
    const draft = normalizeThemeDraft(BARE);
    expect(draft.motion.disposition).toBe('not-authored');
    const view = projectThemeDraft(draft);
    view.motion = { entrance: 'fade' };
    const relifted = readThemeDraft(view, draft);
    expect(relifted.motion.disposition).toBeUndefined();
    expect(relifted.motion.value).toEqual({ entrance: 'fade' });
    // A family the view still does not carry keeps the reason it came in with.
    expect(relifted.recipes.disposition).toBe('not-authored');
  });

  it('edits a governed family the incoming draft never authored', async () => {
    // The carry must not outrank authorship: a draft whose `motion` is withheld
    // is the ordinary case (every partial `value` in the tree lifts that way),
    // and the Motion section exists to make the first edit to it.
    const seen: Theme[] = [];
    function Host(): React.ReactElement {
      const [draft, setDraft] = useState<Theme>(normalizeThemeDraft(BARE));
      return (
        <PatternBrandStudio
          vertical={VERTICAL}
          value={draft}
          title="Bare Draft Studio"
          onChange={(next) => {
            setDraft(next);
            seen.push(next);
          }}
        />
      );
    }
    render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <Host />
      </DesignSystemProvider>,
    );
    await screen.findByText('Bare Draft Studio');
    expect(normalizeThemeDraft(BARE).motion.disposition).toBe('not-authored');

    fireEvent.change(screen.getByLabelText('Hover scale'), { target: { value: '1.08' } });

    const emitted = seen[seen.length - 1]!;
    expect(emitted.motion.disposition).toBeUndefined();
    expect(emitted.motion.value?.hoverScale).toBe(1.08);
    // The edit survives the door, not merely the payload.
    expect(projectThemeDraft(emitted).motion?.hoverScale).toBe(1.08);
    // And the controlled host re-renders with it, which is what an editor is.
    expect((screen.getByLabelText('Hover scale') as HTMLInputElement).value).toBe('1.08');
  });

  it('accepts a governed draft as `value` and emits a governed draft from `onChange`', async () => {
    const seen: Theme[] = [];
    function Host(): React.ReactElement {
      const [draft, setDraft] = useState<Theme | FlatTheme>(normalizeThemeDraft(FLAT));
      return (
        <PatternBrandStudio
          vertical={VERTICAL}
          value={draft}
          title="Draft Transport Studio"
          onChange={(next) => {
            setDraft(next);
            seen.push(next);
          }}
        />
      );
    }
    render(
      <DesignSystemProvider tenantConfig={TEST_TENANT} forceEngine="rustic" skipCssLoading>
        <Host />
      </DesignSystemProvider>,
    );
    await screen.findByText('Draft Transport Studio');

    fireEvent.change(screen.getByLabelText('Card bg'), { target: { value: '#0b0b0b' } });
    const emitted = seen[seen.length - 1]!;
    // The payload is the TRANSPORT: every governed family arrives wrapped.
    for (const family of ['motion', 'charts', 'recipes', 'expressive', 'responsive'] as const) {
      const slot = emitted[family] as unknown as Record<string, unknown>;
      expect(Object.keys(slot).every((key) => key === 'value' || key === 'disposition')).toBe(true);
    }
    // And it still carries the edit, through the same door the panel compiles with.
    expect(projectThemeDraft(emitted).chrome?.cardComponent?.bg).toBe('#0b0b0b');
    expect(
      buildSurfaceVariables(emitted, {
        key: 'light',
        baseTheme: 'light',
        vertical: VERTICAL,
        tenantSlug: SLUG,
      }).vars['--ds-card-bg'],
    ).toBe('#0b0b0b');
  });
});

describe('WO-DER-08 named-residue drills', () => {
  const STUDIO = join(process.cwd(), 'src/components/patterns/customization/brand-studio');
  const sources = [
    'index.tsx',
    'contracts/index.ts',
    'runtime/file-export/index.ts',
  ] as const;

  it('no studio source names the lowering lift or a second lift helper', () => {
    for (const relative of sources) {
      const source = readFileSync(join(STUDIO, relative), 'utf8');
      expect(source, `${relative}:liftAuthoredTheme`).not.toMatch(/\bliftAuthoredTheme\b/u);
      expect(source, `${relative}:governedTenantTheme`).not.toMatch(/\bgovernedTenantTheme\b/u);
    }
  });

  it('the superseded flat pair stays published exactly while its end trigger is unmet', () => {
    const contract = JSON.parse(
      readFileSync(join(process.cwd(), 'contracts/runtime/suppliers/index.json'), 'utf8'),
    ) as { entrypoints: Record<string, { exports: string[] }> };
    const published = new Set(contract.entrypoints['.']?.exports ?? []);
    // END TRIGGER: when the published set stops naming the flat pair, the
    // window is over and the exports must go with it. Until then, removing
    // them breaks a consumer that still ships the byte-identical snapshot.
    for (const name of ['serializeFlatTheme', 'deserializeFlatTheme'] as const) {
      expect(published.has(name), `${name}: published/exported must agree`).toBe(true);
    }
    expect(typeof serializeFlatTheme).toBe('function');
    expect(typeof deserializeFlatTheme).toBe('function');
  });
});
