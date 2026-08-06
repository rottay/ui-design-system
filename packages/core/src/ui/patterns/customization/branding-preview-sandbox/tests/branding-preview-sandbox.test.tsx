import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { BrandingPreviewSandbox } from '..';

describe('BrandingPreviewSandbox', () => {
  it('emits the compiled palette variable inside the scoped rule', () => {
    const { container } = render(
      <BrandingPreviewSandbox appearance={{ general: { palette: { primary: '#FF0000' } } }} />,
    );

    const style = container.querySelector('style');
    expect(style?.textContent).toContain('#FF0000');
  });

  it('refuses an extraVars value that would escape the scoped rule', () => {
    const { container } = render(
      <BrandingPreviewSandbox
        appearance={{ general: { palette: { primary: '#FF0000' } } }}
        extraVars={{ '--ds-color-accent': 'red} body { display: none; ' }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).not.toContain('display: none');
    expect(css).not.toContain('body');
  });

  it('refuses an extraVars name that is not a --ds custom property', () => {
    const { container } = render(
      <BrandingPreviewSandbox
        appearance={{ general: { palette: { primary: '#FF0000' } } }}
        extraVars={{ 'background:url(javascript:alert(1))': 'red' }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).not.toContain('javascript:');
  });

  it('keeps a safe extraVar in the same batch that drops the hostile ones', () => {
    // A guard that dropped the whole batch would pass every rejection check
    // above while silently disabling the preview, so the survivor is asserted.
    const { container } = render(
      <BrandingPreviewSandbox
        appearance={{ general: { palette: { primary: '#FF0000' } } }}
        extraVars={{
          '--ds-color-accent': '#2F6FEB',
          '--ds-color-border': 'red; } [data-escape] { display: none',
          '--ds-color-surface': 'url(javascript:alert(1))',
          'color: red; --ds-color-text-primary': '#111111',
        }}
      />,
    );

    const css = container.querySelector('style')?.textContent ?? '';
    expect(css).toContain('--ds-color-accent: #2F6FEB;');
    expect(css).not.toContain('display: none');
    expect(css).not.toContain('javascript:');
    expect(css).not.toContain('color: red');
    // One opening and one closing brace: the rule was never escaped.
    expect(css.match(/\{/g)).toHaveLength(1);
    expect(css.match(/\}/g)).toHaveLength(1);
  });
});
