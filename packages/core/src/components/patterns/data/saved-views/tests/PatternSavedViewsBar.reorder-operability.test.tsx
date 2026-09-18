/**
 * The keyboard reorder protocol the bar GAINED in WO-FAM-08 / F-69 lot 6 — a
 * DECLARED ADDITION, not a transport pin. Before this lot the only way to
 * reorder a view was an HTML5 pointer drag from the pill, the grip was
 * `aria-hidden` chrome, and nothing was ever announced.
 *
 * The drill walks the whole round trip: grab, each arrow, a blocked edge twice
 * over, Escape, the commit, and the same arrow under `dir="rtl"` — plus the
 * keys the bar already owned, which the grab protocol must not take.
 */
import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';
import { I18nProvider } from '@/infrastructure/runtime/i18n';
import { renderWithEngine } from '@tests/support/engine';
import {
  AXE_SCOPES,
  auditAxe,
  axeDebt,
  seriousFindings,
} from '@tests/support/family-causality';
import type { SavedView } from '../contracts';
import ModernSavedViewsBar from '../engines/modern';

const VIEWS: SavedView[] = [
  { id: 'all', name: 'All items', isDefault: true, config: {} },
  { id: 'active', name: 'Active only', config: {} },
  { id: 'mine', name: 'Assigned to me', config: {} },
];

/**
 * The bar is controlled, so the drill owns the order: without a parent that
 * applies `onViewReorder` a commit would leave the DOM in its old order and
 * "the item moved" could not be read where the user reads it.
 */
function Harness({
  onViewReorder,
  onViewSelect,
}: {
  onViewReorder: (ids: string[]) => void;
  onViewSelect?: (id: string) => void;
}) {
  const [views, setViews] = React.useState<SavedView[]>(VIEWS);
  return (
    <ModernSavedViewsBar
      views={views}
      activeViewId="all"
      onViewSelect={onViewSelect ?? (() => undefined)}
      onViewRename={() => undefined}
      onViewReorder={(ids) => {
        onViewReorder(ids);
        setViews((previous) =>
          ids
            .map((id) => previous.find((view) => view.id === id))
            .filter((view): view is SavedView => view !== undefined),
        );
      }}
    />
  );
}

function mount(dir: 'ltr' | 'rtl' = 'ltr') {
  const onViewReorder = vi.fn();
  const onViewSelect = vi.fn();
  const bar = <Harness onViewReorder={onViewReorder} onViewSelect={onViewSelect} />;
  const utils = renderWithEngine(
    dir === 'rtl' ? (
      <I18nProvider locale="ar" fallbackLocale="en">
        {bar}
      </I18nProvider>
    ) : (
      bar
    ),
    'modern',
  );
  return { ...utils, onViewReorder, onViewSelect };
}

/** The grip is the move affordance; its accessible name is how a user finds it. */
function gripFor(name: string): HTMLElement {
  return screen.getByRole('button', { name: `Reorder ${name}` });
}

/** The order where the user reads it: the rendered pills. */
function order(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('[data-testid^="view-tab-"]')).map(
    (node) => node.getAttribute('data-testid')?.replace('view-tab-', '') ?? '',
  );
}

/**
 * The pair is identified by what it IS — two polite status regions — because the
 * announcer stamps no `data-part`: the VisuallyHidden primitive owns the clip,
 * so there is no anatomy for a skin rule to paint.
 */
function regions(container: HTMLElement): string[] {
  const found = Array.from(container.querySelectorAll('[role="status"][aria-live="polite"]'));
  expect(found).toHaveLength(2);
  return found.map((node) => node.textContent ?? '');
}

/** Politeness is the kernel's, so it is asserted once, on the region itself. */
function announced(container: HTMLElement): string {
  return regions(container).join('');
}

function press(element: HTMLElement, key: string): void {
  act(() => {
    fireEvent.keyDown(element, { key });
  });
}

describe('SavedViewsBar keyboard reorder', () => {
  it('exposes the grip as a real control, and both live regions start empty', () => {
    const { container } = mount();

    const grip = gripFor('All items');
    expect(grip.getAttribute('aria-hidden')).toBeNull();
    expect(grip).toHaveAttribute('tabindex', '0');
    expect(regions(container)).toEqual(['', '']);
    for (const region of container.querySelectorAll('[role="status"]')) {
      expect(region).toHaveAttribute('aria-live', 'polite');
      expect(region.className).toContain('ds-visually-hidden');
    }
  });

  it('the grab key announces the protocol and stages nothing', () => {
    const { container, onViewReorder } = mount();

    press(gripFor('All items'), ' ');

    expect(announced(container)).toContain('All items');
    expect(announced(container).length).toBeGreaterThan(0);
    expect(order(container)).toEqual(['all', 'active', 'mine']);
    expect(onViewReorder).not.toHaveBeenCalled();
  });

  it('every arrow changes what the region says, and commits nothing on the way', () => {
    const { container, onViewReorder } = mount();
    const grip = gripFor('All items');

    press(grip, ' ');
    press(grip, 'ArrowRight');
    const first = announced(container);
    press(grip, 'ArrowRight');
    const second = announced(container);

    expect(first).toContain('Position 2 of 3');
    expect(second).toContain('Position 3 of 3');
    expect(first).not.toEqual(second);
    expect(order(container)).toEqual(['all', 'active', 'mine']);
    expect(onViewReorder).not.toHaveBeenCalled();
  });

  /**
   * The identical-outcome case §6.2 names: a second blocked press writes the
   * SAME string, so it only re-announces because the two regions alternate.
   * Reading the concatenation alone would be green on a single stuck region.
   */
  it('a blocked edge announces, moves nothing, and re-announces when repeated', () => {
    const { container, onViewReorder } = mount();
    const grip = gripFor('All items');

    press(grip, ' ');
    press(grip, 'ArrowLeft');
    const firstRegions = regions(container);
    press(grip, 'ArrowLeft');
    const secondRegions = regions(container);

    expect(announced(container)).toContain('Cannot move All items further');
    expect(firstRegions).not.toEqual(secondRegions);
    expect(firstRegions.filter(Boolean)).toEqual(secondRegions.filter(Boolean));
    expect(order(container)).toEqual(['all', 'active', 'mine']);
    expect(onViewReorder).not.toHaveBeenCalled();
  });

  it('Escape restores the pre-grab order and says so', () => {
    const { container, onViewReorder } = mount();
    const grip = gripFor('All items');

    press(grip, ' ');
    press(grip, 'ArrowRight');
    press(grip, 'Escape');

    expect(announced(container)).toContain('Reorder cancelled');
    expect(announced(container)).toContain('position 1 of 3');
    expect(order(container)).toEqual(['all', 'active', 'mine']);
    expect(onViewReorder).not.toHaveBeenCalled();
  });

  it('the grab key commits once and focus lands on the view that moved', () => {
    const { container, onViewReorder } = mount();
    const grip = gripFor('All items');

    press(grip, ' ');
    press(grip, 'ArrowRight');
    press(grip, ' ');

    expect(onViewReorder.mock.calls).toEqual([[['active', 'all', 'mine']]]);
    expect(order(container)).toEqual(['active', 'all', 'mine']);
    expect(announced(container)).toContain('All items dropped at position 2 of 3');
    expect(gripFor('All items')).toHaveFocus();
  });

  it('a second grab after a commit starts from the new position', () => {
    const { container, onViewReorder } = mount();

    press(gripFor('All items'), ' ');
    press(gripFor('All items'), 'ArrowRight');
    press(gripFor('All items'), ' ');
    press(gripFor('All items'), ' ');
    press(gripFor('All items'), 'ArrowRight');

    expect(announced(container)).toContain('Position 3 of 3');
    expect(onViewReorder).toHaveBeenCalledTimes(1);
    expect(order(container)).toEqual(['active', 'all', 'mine']);
  });

  /**
   * The direction authority is the i18n locale, never a DOM probe: under `ar`
   * the same physical key resolves the opposite logical intent, so ArrowLeft
   * moves the first view FORWARD where LTR refuses it at the edge.
   */
  it('mirrors the arrows under dir="rtl"', () => {
    const { container, onViewReorder } = mount('rtl');
    const grip = gripFor('All items');

    press(grip, 'ArrowLeft');
    expect(announced(container)).toEqual('');

    press(grip, ' ');
    press(grip, 'ArrowLeft');
    expect(announced(container)).toContain('Position 2 of 3');

    press(grip, ' ');
    expect(onViewReorder.mock.calls).toEqual([[['active', 'all', 'mine']]]);
    expect(order(container)).toEqual(['active', 'all', 'mine']);
  });

  it('refuses the logical edge under dir="rtl" too', () => {
    const { container, onViewReorder } = mount('rtl');
    const grip = gripFor('All items');

    press(grip, ' ');
    press(grip, 'ArrowRight');

    expect(announced(container)).toContain('Cannot move All items further');
    expect(onViewReorder).not.toHaveBeenCalled();
  });
});

/**
 * The bar owned Space, Enter and Escape on three controls before this lot. The
 * grab protocol binds on the grip alone, and the kernel ignores a key pressed
 * on anything inside the drag source, so all three keep their meaning.
 */
describe('SavedViewsBar keys the reorder protocol must not take', () => {
  it('leaves Space and Enter on the select control alone', () => {
    const { container, onViewSelect } = mount();
    const select = screen.getByRole('button', { name: 'All items' });

    press(select, ' ');
    press(select, 'Enter');

    expect(announced(container)).toEqual('');

    act(() => {
      fireEvent.click(select);
    });
    expect(onViewSelect).toHaveBeenCalledWith('all');
  });

  it('leaves the rename editor its own Enter and Escape', () => {
    const { container } = mount();

    act(() => {
      fireEvent.click(screen.getByLabelText('Active only options'));
    });
    act(() => {
      fireEvent.click(screen.getByText('Rename'));
    });
    const input = screen.getByLabelText('Rename');

    press(input, 'Escape');

    expect(screen.queryByLabelText('Rename')).toBeNull();
    expect(announced(container)).toEqual('');
  });

  it('leaves the actions menu trigger its own keys', () => {
    const { container } = mount();
    const trigger = screen.getByLabelText('All items options');

    press(trigger, 'Enter');

    expect(announced(container)).toEqual('');
  });
});

/**
 * The grip is a NEW interactive node, and the family's causality fixture renders
 * the bar WITHOUT `onViewReorder` — so it never sees one. This leg audits the
 * reorderable bar on its own, with the same identity-pinned debt discipline: a
 * nameless control, a focusable `aria-hidden`, or a role axe refuses would land
 * here as a rule id with the node that failed it.
 */
describe('SavedViewsBar reorder affordance accessibility', () => {
  const markup = renderToStaticMarkup(
    <EngineProvider defaultEngine="modern">
      <ModernSavedViewsBar
        views={VIEWS}
        activeViewId="all"
        onViewSelect={() => undefined}
        onViewRename={() => undefined}
        onViewReorder={() => undefined}
      />
    </EngineProvider>,
  );

  it('carries no serious axe finding once the grip is a control', async () => {
    expect(markup).toContain('aria-label="Reorder All items"');
    expect(markup).not.toContain('aria-hidden="true"><svg');

    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual({});
  }, 300_000);
});
