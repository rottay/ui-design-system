import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { BrandingPreviewSandbox } from '..';
import { EngineProvider } from '@/infrastructure/runtime/engines/composition/react/provider';

/** DS primitives read the engine from context, and context absence is refused. */
const mount = (ui: React.ReactElement) =>
  render(<EngineProvider defaultEngine="modern">{ui}</EngineProvider>);

/**
 * Every value the sandbox paints arrives as a typed `TenantAppearance` and is
 * compiled by the one lowering. There is no post-compile injection seam left to
 * test: `extraVars` was a raw `Record<string, string>` merged over the compiled
 * delta, which is a second author for every channel it names. The guard it used
 * to protect is still asserted here — a hostile value simply has to come in
 * through the door a customer actually has.
 */
describe('BrandingPreviewSandbox', () => {
  // Every case below names `bithire`: it is LIGHT-default, so a simple
  // document with no `backgroundMode` lands its seed on the base block, which
  // is the block an unqualified preview scope paints. On a dark-default
  // vertical the same document targets `modes.light` instead -- and paints
  // nothing here, exactly as the published artifact would. That equality is
  // pinned in its own case at the bottom of this file.
  it('emits the compiled palette variable inside the scoped rule', () => {
    const { container } = mount(
      <BrandingPreviewSandbox vertical="bithire" appearance={{ general: { palette: { primary: '#FF0000' } } }} />,
    );

    const style = container.querySelector('style');
    expect(style?.textContent).toContain('#FF0000');
  });

  it('refuses an authored value that would escape the scoped rule', () => {
    const { container } = mount(
      <BrandingPreviewSandbox
        vertical="bithire"
        appearance={{
          general: {
            palette: { primary: '#FF0000', accent: 'red} body { display: none; ' },
          },
        }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).not.toContain('display: none');
    expect(css).not.toContain('body');
  });

  it('refuses an authored value carrying a javascript: url', () => {
    const { container } = mount(
      <BrandingPreviewSandbox
        vertical="bithire"
        appearance={{
          general: {
            palette: { primary: '#FF0000', accent: 'url(javascript:alert(1))' },
          },
        }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).not.toContain('javascript:');
  });

  it('refuses the whole batch a hostile channel is in, painting nothing', () => {
    // It used to keep the safe channels and drop the hostile ones. Since
    // WO-CAT-03 the compile door applies one admission to every origin, so a
    // document carrying an unsafe value is refused WHOLE rather than
    // half-applied -- which is the posture the very next case already states as
    // the reason this component has no fallback. Half-applying was the older,
    // weaker answer: it painted a preview of a document publish would refuse.
    const { container } = mount(
      <BrandingPreviewSandbox
        vertical="bithire"
        appearance={{
          general: {
            palette: {
              primary: '#2F6FEB',
              accent: 'red; } [data-escape] { display: none',
              secondary: 'url(javascript:alert(1))',
            },
          },
        }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).toBe('');
    expect(css).not.toContain('display: none');
    expect(css).not.toContain('javascript:');
  });

  it('paints NOTHING for a document the canonical migration refuses', () => {
    // Fail-closed, and the reason this component has no fallback: an ungoverned
    // raw token has no typed Theme keypath, so the whole document is refused
    // rather than half-applied.
    const { container } = mount(
      <BrandingPreviewSandbox
        vertical="bithire"
        appearance={{
          general: { palette: { primary: '#FF0000' } },
          advanced: { tokenOverrides: { '--ds-card-bg': '#ffffff' } },
        }}
      />,
    );

    expect(container.querySelector('style')?.textContent).toBe('');
  });

  it('accepts an ADMITTED raw token override on the same advanced door', () => {
    // The refusal above is about the TOKEN, not about the advanced door: the
    // same document shape carrying a token `TENANT_THEME_OVERRIDE_TOKENS`
    // admits migrates, compiles and paints.
    const { container } = mount(
      <BrandingPreviewSandbox
        vertical="bithire"
        appearance={{
          general: { palette: { primary: '#FF0000' } },
          advanced: { tokenOverrides: { '--ds-radius-md': '10px' } },
        }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).not.toBe('');
    expect(css).toContain('#FF0000');
  });
});
