import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { mockMatchMedia } from '@tests/support/browser/match-media';
import {
  resolveAdaptiveFormFieldColumnSpan,
  resolveAdaptiveFormLayout,
} from '../runtime/responsive';
import ClassicFormBuilder from '../engines/classic';
import ModernFormBuilder from '../engines/modern';
import RusticFormBuilder from '../engines/rustic';

const ENGINE_COMPONENTS = [
  ['classic', ClassicFormBuilder],
  ['modern', ModernFormBuilder],
  ['rustic', RusticFormBuilder],
] as const;

const fields = [{ name: 'name', label: 'Name', type: 'text' as const, colSpan: 3 }];

describe('PatternFormBuilder responsive layout', () => {
  it.each(ENGINE_COMPONENTS)(
    'collapses a 3-column grid to one column at 320 and 390 in the %s engine',
    (_engine, Component) => {
      const phoneWidths = [320, 390];
      for (const width of phoneWidths) {
        mockMatchMedia(width);
        const { container, unmount } = render(
          <Component fields={fields} layout="grid" columns={3} autoAdaptive onSubmit={() => undefined} />
        );

        expect(container.querySelector('[style*="grid-template-columns"]')).toBeNull();
        expect(container.querySelector('[style*="grid-column"]')).toBeNull();
        unmount();
      }
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'caps a 3-column grid and its field span at two on tablet in the %s engine',
    (_engine, Component) => {
      mockMatchMedia(768);
      const { container } = render(
        <Component fields={fields} layout="grid" columns={3} autoAdaptive onSubmit={() => undefined} />
      );

      expect(container.querySelector('[style*="grid-template-columns: repeat(2"]')).toBeTruthy();
      expect(container.querySelector('[style*="grid-column: span 2"]')).toBeTruthy();
      expect(container.querySelector('[style*="grid-column: span 3"]')).toBeNull();
    }
  );

  it.each(ENGINE_COMPONENTS)(
    'preserves a desktop field span exactly in the %s engine',
    (_engine, Component) => {
      mockMatchMedia(1280);
      const { container } = render(
        <Component fields={fields} layout="grid" columns={2} autoAdaptive onSubmit={() => undefined} />
      );

      expect(container.querySelector('[style*="grid-column: span 3"]')).toBeTruthy();
    }
  );

  it('turns phone horizontal layouts vertical while preserving desktop opt-out', () => {
    expect(
      resolveAdaptiveFormLayout({
        layout: 'horizontal',
        columns: 3,
        autoAdaptive: true,
        isMobile: true,
        isTablet: false,
      })
    ).toEqual({ layout: 'vertical', columns: 1 });

    expect(
      resolveAdaptiveFormLayout({
        layout: 'horizontal',
        columns: 3,
        autoAdaptive: false,
        isMobile: true,
        isTablet: false,
      })
    ).toEqual({ layout: 'horizontal', columns: 3 });

    expect(
      resolveAdaptiveFormLayout({
        layout: 'grid',
        columns: 2.75,
        autoAdaptive: true,
        isMobile: false,
        isTablet: false,
      })
    ).toEqual({ layout: 'grid', columns: 2.75 });

    expect(
      resolveAdaptiveFormFieldColumnSpan({
        columnSpan: 3.5,
        columns: 2,
        autoAdaptive: false,
        isMobile: false,
        isTablet: true,
      })
    ).toBe(3.5);

    expect(
      resolveAdaptiveFormFieldColumnSpan({
        columnSpan: 3.5,
        columns: 2,
        autoAdaptive: true,
        isMobile: false,
        isTablet: false,
      })
    ).toBe(3.5);
  });
});


describe('ModernFormBuilder section content growth', () => {
  const observers: ContentResizeObserver[] = [];
  let heightReads = 0;

  class ContentResizeObserver {
    targets = new Set<Element>();
    disconnect = vi.fn(() => this.targets.clear());
    observe = vi.fn((target: Element) => this.targets.add(target));
    unobserve = vi.fn((target: Element) => this.targets.delete(target));

    constructor(readonly callback: ResizeObserverCallback) {
      observers.push(this);
    }

    notify() {
      this.callback([], this as unknown as ResizeObserver);
    }
  }

  const notifyContentResize = () => act(() => {
    observers.filter((observer) => observer.targets.size > 0)
      .forEach((observer) => observer.notify());
  });

  const requiredFields = [
    { name: 'section:details', label: 'Details', type: 'custom' as const },
    {
      name: 'name', label: 'Name', type: 'custom' as const, required: true,
      render: () => <input aria-label="Name" />,
    },
    { name: 'detail', type: 'custom' as const, render: () => <GrowingContent /> },
  ];

  function GrowingContent() {
    const [grown, setGrown] = React.useState(false);
    return (
      <button type="button" data-extra-height={grown ? '160' : '0'} onClick={() => setGrown(!grown)}>
        {grown ? 'Less detail' : 'More detail'}
      </button>
    );
  }

  const growingFields = [
    { name: 'section:details', label: 'Details', type: 'custom' as const },
    { name: 'detail', type: 'custom' as const, render: () => <GrowingContent /> },
  ];

  const sectionContent = (container: HTMLElement) => {
    const content = container.querySelector<HTMLDivElement>('[data-part="section-content"]');
    if (!content) throw new Error('Expected a rendered section content element');
    return content;
  };

  beforeEach(() => {
    observers.length = 0;
    heightReads = 0;
    mockMatchMedia(1280);
    vi.stubGlobal('ResizeObserver', ContentResizeObserver);
    // DOM runners have no layout. Derive the measured height from real rendered
    // errors/child state, and deliver resize notifications explicitly.
    vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockImplementation(function (this: HTMLElement) {
      heightReads += 1;
      const extra = this.querySelector('[data-extra-height]');
      return 100 + (this.querySelector('[data-part="field-error"]') ? 48 : 0)
        + Number(extra?.getAttribute('data-extra-height') ?? 0);
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('follows submit validation growth without fields or values changing', () => {
    const onSubmit = vi.fn();
    const onValidationChange = vi.fn();
    const { container } = render(
      <ModernFormBuilder fields={requiredFields} showLabels={false}
        onSubmit={onSubmit} onValidationChange={onValidationChange} />
    );
    const content = sectionContent(container);
    expect(content.scrollHeight).toBe(100);
    expect(content.style.maxHeight).toBe('100px');
    fireEvent.submit(container.querySelector('form')!);
    expect(screen.getByRole('alert')).toHaveTextContent('Name is required');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', screen.getByRole('alert').id);
    expect(onValidationChange).toHaveBeenCalledWith({ name: 'Name is required' });
    expect(onSubmit).not.toHaveBeenCalled();
    expect(content.scrollHeight).toBe(148);
    expect(content.style.maxHeight).toBe('148px');
    fireEvent.click(screen.getByRole('button', { name: 'More detail' }));
    notifyContentResize();
    expect(content.scrollHeight).toBe(308);
    expect(content.style.maxHeight).toBe('308px');
  });

  it('follows later child growth and shrinkage through the unclipped fields container', () => {
    const { container } = render(
      <ModernFormBuilder fields={growingFields} showLabels={false} onSubmit={() => undefined} />
    );
    const content = sectionContent(container);
    expect(content.style.maxHeight).toBe('100px');
    fireEvent.click(screen.getByRole('button', { name: 'More detail' }));
    expect(content.scrollHeight).toBe(260);
    notifyContentResize();
    expect(content.style.maxHeight).toBe('260px');
    const targets = observers.flatMap((observer) => Array.from(observer.targets));
    expect(targets).toContain(content.firstElementChild);
    expect(targets).not.toContain(content);
    fireEvent.click(screen.getByRole('button', { name: 'Less detail' }));
    notifyContentResize();
    expect(content.style.maxHeight).toBe('100px');
  });

  it('keeps collapsed content at zero through growth and reopens at the current height', () => {
    const { container } = render(
      <ModernFormBuilder fields={growingFields} showLabels={false} onSubmit={() => undefined} />
    );
    const content = sectionContent(container);
    const disclosure = screen.getByRole('button', { name: 'Details' });
    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    expect(content.style.maxHeight).toBe('0');
    fireEvent.click(screen.getByRole('button', { name: 'More detail' }));
    notifyContentResize();
    expect(content.style.maxHeight).toBe('0');
    fireEvent.click(disclosure);
    expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    expect(content.style.maxHeight).toBe('260px');
  });

  it('leaves untitled sections uncapped after validation', () => {
    const untitledFields = requiredFields.slice(1);
    const { container } = render(
      <ModernFormBuilder fields={untitledFields} showLabels={false} onSubmit={() => undefined} />
    );
    const content = sectionContent(container);
    fireEvent.submit(container.querySelector('form')!);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(content.style.maxHeight).toBe('');
    expect(observers.flatMap((observer) => Array.from(observer.targets))).toEqual([]);
  });

  it('disconnects removed content and ignores callbacks delivered after cleanup', () => {
    const { container, rerender, unmount } = render(
      <ModernFormBuilder fields={growingFields} showLabels={false} onSubmit={() => undefined} />
    );
    const content = sectionContent(container);
    const active = observers.filter((observer) => observer.targets.has(content.firstElementChild!));
    expect(active.length).toBeGreaterThan(0);
    rerender(<ModernFormBuilder loading fields={growingFields} onSubmit={() => undefined} />);
    active.forEach((observer) => expect(observer.disconnect).toHaveBeenCalled());
    const readsAfterRemoval = heightReads;
    act(() => active.forEach((observer) => observer.notify()));
    expect(heightReads).toBe(readsAfterRemoval);
    rerender(<ModernFormBuilder fields={growingFields} showLabels={false} onSubmit={() => undefined} />);
    const resumed = sectionContent(container);
    expect(observers.some((observer) => observer.targets.has(resumed.firstElementChild!))).toBe(true);
    unmount();
    const readsAfterUnmount = heightReads;
    act(() => observers.forEach((observer) => observer.notify()));
    expect(heightReads).toBe(readsAfterUnmount);
    expect(observers.every((observer) => observer.targets.size === 0)).toBe(true);
  });

  it('measures validation and window reflow without ResizeObserver and removes the resize listener', () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const addListener = vi.spyOn(window, 'addEventListener');
    const removeListener = vi.spyOn(window, 'removeEventListener');
    const { container, unmount } = render(
      <ModernFormBuilder fields={requiredFields} showLabels={false} onSubmit={() => undefined} />
    );
    const content = sectionContent(container);
    fireEvent.submit(container.querySelector('form')!);
    expect(content.style.maxHeight).toBe('148px');
    screen.getByRole('textbox').setAttribute('data-extra-height', '160');
    fireEvent(window, new Event('resize'));
    expect(content.scrollHeight).toBe(308);
    expect(content.style.maxHeight).toBe('308px');
    unmount();
    const added = addListener.mock.calls.filter((call) => call.at(0) === 'resize');
    const removed = removeListener.mock.calls.filter((call) => call.at(0) === 'resize');
    expect(added.length).toBeGreaterThan(0);
    added.forEach((call) => expect(removed.some((other) => other.at(1) === call.at(1))).toBe(true));
    const readsAfterUnmount = heightReads;
    fireEvent(window, new Event('resize'));
    expect(heightReads).toBe(readsAfterUnmount);
  });


  it('updates each titled section independently after a reflow notification', () => {
    const twoSections = [
      ...requiredFields,
      { name: 'section:other', label: 'Other', type: 'custom' as const },
      { name: 'other', type: 'custom' as const, render: () => <input aria-label="Other" /> },
    ];
    const { container } = render(
      <ModernFormBuilder fields={twoSections} showLabels={false} onSubmit={() => undefined} />
    );
    const contents = Array.from(container.querySelectorAll<HTMLDivElement>('[data-part="section-content"]'));
    expect(contents.map((content) => content.style.maxHeight)).toEqual(['100px', '100px']);
    screen.getByRole('textbox', { name: 'Other' }).setAttribute('data-extra-height', '240');
    notifyContentResize();
    expect(contents.map((content) => content.style.maxHeight)).toEqual(['100px', '340px']);
    fireEvent.submit(container.querySelector('form')!);
    expect(contents.map((content) => content.style.maxHeight)).toEqual(['148px', '340px']);
  });

  it('retains the initial server fallback before DOM measurement', () => {
    const markup = renderToString(
      <ModernFormBuilder fields={growingFields} showLabels={false} onSubmit={() => undefined} />
    );
    expect(markup).toContain('max-height:2000px');
    expect(observers).toHaveLength(0);
  });
});
