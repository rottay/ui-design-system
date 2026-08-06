import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResponsiveSlot } from '../index';

const wrappers = (container: HTMLElement) =>
  container.querySelectorAll('[data-component="responsive-visibility"], style').length;

describe('ResponsiveSlot falsy slot content', () => {
  it('emits nothing for a device slot whose condition resolved to false', () => {
    const showBanner = false;
    const { container } = render(
      <ResponsiveSlot
        phone={showBanner && <span>banner</span>}
        desktop={<span>desktop</span>}
      />
    );

    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(1);
    expect(spans[0].textContent).toBe('desktop');
  });

  it('emits nothing at all when every device slot resolved to false', () => {
    const showBanner = false;
    const { container } = render(
      <ResponsiveSlot
        phone={showBanner && <span>phone</span>}
        tablet={showBanner && <span>tablet</span>}
        desktop={showBanner && <span>desktop</span>}
      />
    );

    expect(container.textContent).toBe('');
    expect(wrappers(container)).toBe(0);
  });

  it('emits nothing for a standard breakpoint slot that resolved to false', () => {
    const showBanner = false;
    const { container } = render(
      <ResponsiveSlot xs={showBanner && <span>xs</span>} lg={<span>lg</span>} />
    );

    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(1);
    expect(spans[0].textContent).toBe('lg');
  });

  it('emits nothing at all when every standard slot resolved to false or null', () => {
    const showBanner = false;
    const { container } = render(
      <ResponsiveSlot xs={showBanner && <span>xs</span>} lg={null} />
    );

    expect(container.textContent).toBe('');
    expect(wrappers(container)).toBe(0);
  });

  it('still renders a slot whose content is a legitimate zero', () => {
    const { container } = render(<ResponsiveSlot phone={0} desktop={<span>desktop</span>} />);

    expect(container.textContent).toContain('0');
  });
});
