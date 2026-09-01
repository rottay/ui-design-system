import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { renderWithEngine, STABLE_ENGINES } from '@tests/support/engine';

describe('NavLink integration', () => {
  it.each(STABLE_ENGINES)('renders the live link through the %s engine', async (engine) => {
    const { NavLink } = await import('..');

    renderWithEngine(
      <NavLink engine={engine} href="/docs" type="primary">
        Design system docs
      </NavLink>,
      engine
    );

    const link = await screen.findByRole('link', { name: /design system docs/i }, { timeout: 30000 });
    expect(link).toHaveAttribute('href', '/docs');
  }, 45000);

  it.each(STABLE_ENGINES)(
    'supports disabled, external, and underline variants through the %s engine',
    async (engine) => {
      const { NavLink } = await import('..');
      const handleClick = vi.fn();

      const { rerender } = renderWithEngine(
        <NavLink
          engine={engine}
          href="https://example.com"
          external
          underline={false}
          onClick={handleClick}
        >
          External link
        </NavLink>,
        engine
      );

      const externalLink = await screen.findByRole(
        'link',
        { name: /external link/i },
        { timeout: 30000 }
      );

      expect(externalLink).toHaveAttribute('href', 'https://example.com');
      expect(externalLink).toHaveAttribute('target', '_blank');
      expect(externalLink).toHaveAttribute('rel', 'noopener noreferrer');

      if (engine === 'modern') {
        // The modern skin owns the underline policy through the data contract;
        // the engine stamps no DaisyUI classes or inline paint.
        expect(externalLink).toHaveAttribute('data-underline', 'false');
        expect(externalLink.className).not.toMatch(/(^|\s)(link|link-info|no-underline)(\s|$)/);
      } else if (engine === 'rustic') {
        expect(externalLink).toHaveStyle({ textDecoration: 'none' });
      }

      rerender(
        <NavLink engine={engine} href="/blocked" disabled onClick={handleClick}>
          Disabled link
        </NavLink>
      );

      const disabledLink = await screen.findByText(/disabled link/i, undefined, { timeout: 30000 });
      fireEvent.click(disabledLink);

      await waitFor(() => {
        expect(handleClick).not.toHaveBeenCalled();
      });

      if (disabledLink instanceof HTMLAnchorElement) {
        expect(disabledLink.getAttribute('href')).toBeNull();
      }
    }
  , 45000);
});
