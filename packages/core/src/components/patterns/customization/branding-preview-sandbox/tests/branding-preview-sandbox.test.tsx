import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { BrandingPreviewSandbox } from '..';

/**
 * Every value the sandbox paints arrives as a typed `TenantAppearance` and is
 * compiled by the one lowering. There is no post-compile injection seam left to
 * test: `extraVars` was a raw `Record<string, string>` merged over the compiled
 * delta, which is a second author for every channel it names. The guard it used
 * to protect is still asserted here — a hostile value simply has to come in
 * through the door a customer actually has.
 */
describe('BrandingPreviewSandbox', () => {
  it('emits the compiled palette variable inside the scoped rule', () => {
    const { container } = render(
      <BrandingPreviewSandbox appearance={{ general: { palette: { primary: '#FF0000' } } }} />,
    );

    const style = container.querySelector('style');
    expect(style?.textContent).toContain('#FF0000');
  });

  it('refuses an authored value that would escape the scoped rule', () => {
    const { container } = render(
      <BrandingPreviewSandbox
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
    const { container } = render(
      <BrandingPreviewSandbox
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

  it('keeps the safe channels in the same batch that drops the hostile ones', () => {
    // A guard that dropped the whole batch would pass every rejection check
    // above while silently disabling the preview, so the survivor is asserted.
    const { container } = render(
      <BrandingPreviewSandbox
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
    expect(css).toContain('--ds-color-primary: #2F6FEB;');
    expect(css).not.toContain('display: none');
    expect(css).not.toContain('javascript:');
    // One opening and one closing brace: the rule was never escaped.
    expect(css.match(/\{/g)).toHaveLength(1);
    expect(css.match(/\}/g)).toHaveLength(1);
  });

  it('paints NOTHING for a document the canonical migration refuses', () => {
    // Fail-closed, and the reason this component has no fallback: an ungoverned
    // raw token has no typed Theme keypath, so the whole document is refused
    // rather than half-applied.
    const { container } = render(
      <BrandingPreviewSandbox
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
    const { container } = render(
      <BrandingPreviewSandbox
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
