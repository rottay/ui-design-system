/**
 * The MIGRATED CONSUMER of the WO-DER-08 callback break, executed.
 *
 * WHY IT EXISTS. `PatternBrandStudioProps.onChange` narrowed from
 * `(next: FlatTheme) => void` to `(next: Theme) => void`. That is a breaking
 * change of a published signature -- widening `value` is the OTHER direction of
 * the contract and does not compensate for it -- and the 2026-09-16 re-audit
 * found it undeclared. A changeset alone is a claim; this file is the
 * measurement: an application written the OLD way, kept working through the
 * DOCUMENTED bridge, and the old signature pinned as refused at compile time.
 *
 * WHAT IT IS NOT. It is not a second statement of the transport. Every symbol
 * below is imported by PACKAGE NAME, the way an application imports it, and the
 * bridge is the door's own `projectThemeDraft` -- never a local re-projection,
 * which is exactly the second authority the migration forbids.
 *
 * The negative half follows the precedent of `./index.test.ts`: each
 * `@ts-expect-error` IS the assertion. If the old handler ever becomes
 * assignable again, its directive turns into an unused expect-error and
 * `typecheck:tests` goes red on this file.
 */

import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import {
  DesignSystemProvider,
  PatternBrandStudio,
  deserializeThemeDraft,
  projectThemeDraft,
  readThemeDraft,
  serializeFlatTheme,
  type BrandStudioDraft,
  type FlatTheme,
  type PatternBrandStudioProps,
  type TenantConfig,
} from '@rottay/design-system';
import type { Theme } from '@rottay/design-system/server';

const VERTICAL = 'bithire' as const;
const SLUG = 'callback-migration';

const TENANT: TenantConfig = {
  slug: SLUG,
  name: 'Callback Migration',
  theme: 'light',
  plan: 'enterprise',
  features: ['all'],
  branding: { companyName: 'Callback Migration' },
};

/** The draft this application had on disk before the break. */
const STORED_FLAT: FlatTheme = {
  id: SLUG,
  name: 'Callback Migration',
  palette: { primaryColor: '#2F5BE8' },
  motion: { intensity: 0.6, hoverScale: 1.01 },
};

/**
 * The application's own handler, UNCHANGED across the migration: it is still
 * declared on the flat view, because that is what it persists.
 */
function legacyHandler(received: FlatTheme[]): (next: FlatTheme) => void {
  return (next) => {
    received.push(next);
  };
}

/**
 * The application, as it is written AFTER the migration. The only edit the
 * consumer makes is the wrapper: one call to the published projection.
 */
function MigratedConsumer({ onFlatDraft }: { onFlatDraft: (next: FlatTheme) => void }) {
  const [draft, setDraft] = useState<BrandStudioDraft>(readThemeDraft(STORED_FLAT));
  return (
    <PatternBrandStudio
      vertical={VERTICAL}
      value={draft}
      title="Migrated Consumer Studio"
      onChange={(next) => {
        setDraft(next);
        onFlatDraft(projectThemeDraft(next));
      }}
    />
  );
}

afterEach(() => {
  cleanup();
});

describe('WO-DER-08 migrated consumer: the old flat handler through the documented bridge', () => {
  it('keeps receiving the flat view, with the edit, from a governed payload', async () => {
    const received: FlatTheme[] = [];
    render(
      <DesignSystemProvider tenantConfig={TENANT} forceEngine="modern" skipCssLoading>
        <MigratedConsumer onFlatDraft={legacyHandler(received)} />
      </DesignSystemProvider>,
    );
    await screen.findByText('Migrated Consumer Studio');

    fireEvent.change(screen.getByLabelText('Card bg'), { target: { value: '#0b0b0b' } });

    const flat = received[received.length - 1]!;
    // The legacy handler's own type is honoured: it got the flat view, carrying
    // the edit the user made.
    expect(flat.chrome?.cardComponent?.bg).toBe('#0b0b0b');
    // ...and the governed wrapper vocabulary never reaches it, which is what
    // makes the bridge a projection and not a cast.
    expect(flat.motion).toEqual(STORED_FLAT.motion);
    expect(Object.keys(flat.motion ?? {})).not.toContain('disposition');

    // The controlled host still re-renders with its own state, so the editor is
    // an editor and not a one-shot emitter.
    expect((screen.getByLabelText('Card bg') as HTMLInputElement).value).toBe('#0b0b0b');
  });

  it('opens the draft file the old exporter wrote, through the one discriminant', () => {
    const lifted = deserializeThemeDraft(serializeFlatTheme(STORED_FLAT));
    // The stored file is still readable, and reading it yields the transport:
    // the family arrives wrapped in the governed key vocabulary, carrying the
    // values the flat file held.
    const motion = lifted.motion as unknown as Record<string, unknown>;
    expect(Object.keys(motion).every((key) => key === 'value' || key === 'disposition')).toBe(true);
    expect(motion.value).toEqual(STORED_FLAT.motion);
    // The projection back is what the legacy persistence layer keeps writing.
    expect(projectThemeDraft(lifted).palette?.primaryColor).toBe('#2F5BE8');
  });
});

describe('WO-DER-08: the old callback signature is refused at compile time', () => {
  it('rejects a handler declared on the flat payload', () => {
    const received: FlatTheme[] = [];
    const legacy = legacyHandler(received);

    // @ts-expect-error `onChange` emits the governed `Theme`; a handler declared
    // on `FlatTheme` is no longer assignable. Bridge: `(next) =>
    // legacy(projectThemeDraft(next))`.
    const refused: PatternBrandStudioProps['onChange'] = legacy;
    // The migrated form of the SAME handler is accepted, so the directive above
    // pins the break and not merely a strict-mode accident.
    const accepted: PatternBrandStudioProps['onChange'] = (next: Theme) =>
      legacy(projectThemeDraft(next));

    expect(typeof refused).toBe('function');
    expect(typeof accepted).toBe('function');
  });
});
