import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernTabs from '../engines/modern';
import { VIEW_TRANSITION_DIRECTION_ATTRIBUTE } from '@/graphics/motion/react/runtime/view-transition';
import { mockMatchMedia } from '@/tooling/testing/helpers/browser/match-media';

/** `document` widened so tests can install/remove the optional API method.
 * Omits the DOM lib's own non-optional declaration so the stub can be assigned
 * AND deleted; an intersection would keep the lib signature and forbid both. */
type MutableViewTransitionDocument = Omit<Document, 'startViewTransition'> & {
  startViewTransition?: (update: () => void | Promise<void>) => unknown;
};

const viewTransitionDocument = document as unknown as MutableViewTransitionDocument;

const items = [
  { key: 'overview', label: 'Overview', children: <div>Overview content</div> },
  { key: 'details', label: 'Details', children: <div>Details content</div> },
  { key: 'settings', label: 'Settings', children: <div>Settings content</div> },
];

/**
 * Stub native transition capturing the direction attribute at update time,
 * which is when the browser resolves the directional pseudo-element rules.
 */
function installNativeStartViewTransition(): {
  start: ReturnType<typeof vi.fn>;
  directionsSeen: (string | null)[];
} {
  const directionsSeen: (string | null)[] = [];
  const start = vi.fn((cb: () => void | Promise<void>) => {
    directionsSeen.push(
      document.documentElement.getAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE),
    );
    cb();
    return {
      finished: Promise.resolve(),
      ready: Promise.resolve(),
      updateCallbackDone: Promise.resolve(),
      skipTransition: vi.fn(),
    };
  });
  viewTransitionDocument.startViewTransition = start;
  return { start, directionsSeen };
}

afterEach(() => {
  delete viewTransitionDocument.startViewTransition;
  document.documentElement.removeAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE);
  vi.restoreAllMocks();
});

describe('ModernTabs view-transition choreography', () => {
  it('names the panel as a per-instance view-transition group with the shared panel class', () => {
    render(<ModernTabs items={items} defaultActiveKey="overview" />);

    const panel = screen.getByRole('tabpanel');
    const panelStyle = panel.style as CSSStyleDeclaration & {
      viewTransitionName?: string;
      viewTransitionClass?: string;
    };
    expect(panelStyle.viewTransitionName).toMatch(/^ds-vt-tab-panel-/);
    expect(panelStyle.viewTransitionClass).toBe('ds-vt-tab-panel');
  });

  it('runs a forward-stamped transition when moving to a later tab, and cleans the stamp up', async () => {
    const { start, directionsSeen } = installNativeStartViewTransition();
    render(<ModernTabs items={items} defaultActiveKey="overview" />);

    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));

    expect(start).toHaveBeenCalledTimes(1);
    expect(directionsSeen).toEqual(['forward']);
    // flushSync inside the update callback: the swap is already in the DOM.
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');

    await Promise.resolve();
    await Promise.resolve();
    expect(
      document.documentElement.getAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE),
    ).toBeNull();
  });

  it('runs a backward-stamped transition when moving to an earlier tab', () => {
    const { directionsSeen } = installNativeStartViewTransition();
    render(<ModernTabs items={items} defaultActiveKey="settings" />);

    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));

    expect(directionsSeen).toEqual(['backward']);
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview content');
  });

  it('does not start a transition when re-selecting the active tab', () => {
    const { start } = installNativeStartViewTransition();
    const onChange = vi.fn();
    render(<ModernTabs items={items} defaultActiveKey="overview" onChange={onChange} />);

    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));

    expect(start).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('overview');
  });

  it('swaps instantly (no native transition, no stamp) under reduced motion', () => {
    mockMatchMedia(1024, true);
    const { start } = installNativeStartViewTransition();
    render(<ModernTabs items={items} defaultActiveKey="overview" />);

    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));

    expect(start).not.toHaveBeenCalled();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');
    expect(
      document.documentElement.getAttribute(VIEW_TRANSITION_DIRECTION_ATTRIBUTE),
    ).toBeNull();
  });

  it('swaps instantly when the View Transitions API is absent', () => {
    expect(viewTransitionDocument.startViewTransition).toBeUndefined();
    render(<ModernTabs items={items} defaultActiveKey="overview" />);

    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');
  });

  it('flushes a controlled parent through onChange inside the transition update', () => {
    installNativeStartViewTransition();

    function ControlledHost(): React.ReactElement {
      const [active, setActive] = React.useState('overview');
      return <ModernTabs items={items} activeKey={active} onChange={setActive} />;
    }
    render(<ControlledHost />);

    fireEvent.click(screen.getByRole('tab', { name: 'Details' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details content');
  });
});
