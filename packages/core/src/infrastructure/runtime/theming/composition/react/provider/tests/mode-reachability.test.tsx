/**
 * Mode reachability: a stored preference has to reach the pixels.
 *
 * A mode switch is only real if every link holds: the stored preference becomes
 * the provider's theme, the provider stamps `data-theme`, and the artifact's
 * mode block wins the cascade so the values components read actually move. Each
 * link has been broken independently before, and each break is invisible to a
 * test that asserts the attribute alone -- `data-theme='dark'` on a document
 * whose dark block never matches looks exactly like success.
 *
 * So this asserts COMPUTED custom-property values across a real transition, not
 * strings the provider handed back. The application's chain is
 * cookie -> `forceTheme` -> `DesignSystemProvider` -> this provider's `theme`
 * prop, and this file exercises the DS half of it from that prop onward.
 *
 * The fixture is a minimal stand-in shaped like a real compiled artifact: an
 * unconditional base block carrying the vertical's default mode, plus a
 * `[data-theme='dark']` mode block. Mounting the real artifact would be a
 * quarter-megabyte of CSS to prove a cascade rule that three declarations state
 * just as well.
 */

import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { ThemeProvider } from '..';

const FIXTURE_TENANT = 'w3-mode-fixture';
const FIXTURE_STYLE_ID = 'w3-mode-fixture-artifact';

/** The values the fixture's two blocks declare, kept apart so a leak is loud. */
const BASE_INK = 'rgb(16, 16, 20)';
const DARK_INK = 'rgb(246, 246, 248)';

function mountArtifactFixture(): void {
  const style = document.createElement('style');
  style.id = FIXTURE_STYLE_ID;
  style.textContent = `
    html[data-tenant='${FIXTURE_TENANT}'] {
      --w3-ink: ${BASE_INK};
    }
    html[data-tenant='${FIXTURE_TENANT}'][data-theme='dark'] {
      --w3-ink: ${DARK_INK};
    }
  `;
  document.head.appendChild(style);
}

function computedInk(): string {
  return getComputedStyle(document.documentElement).getPropertyValue('--w3-ink').trim();
}

beforeEach(() => {
  mountArtifactFixture();
  // The tenant channel belongs to TenantProvider; this file owns the mode
  // channel, so the scope the fixture anchors on is stamped directly.
  document.documentElement.setAttribute('data-tenant', FIXTURE_TENANT);
});

afterEach(() => {
  document.getElementById(FIXTURE_STYLE_ID)?.remove();
  document.documentElement.removeAttribute('data-tenant');
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.classList.remove('dark');
  document.documentElement.style.removeProperty('color-scheme');
});

describe('mode reachability', () => {
  it('takes a stored dark preference all the way to the artifact dark block', async () => {
    render(
      <ThemeProvider theme="dark" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
    expect(computedInk()).toBe(DARK_INK);
  });

  it('moves the computed value on a transition and restores it on the way back', async () => {
    const view = render(
      <ThemeProvider theme="base" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('base');
    });
    expect(computedInk()).toBe(BASE_INK);

    view.rerender(
      <ThemeProvider theme="dark" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
    expect(computedInk()).toBe(DARK_INK);

    view.rerender(
      <ThemeProvider theme="base" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('base');
    });
    expect(computedInk()).toBe(BASE_INK);
  });

  it('leaves color-scheme to the stylesheet in the base state and claims it for an explicit mode', async () => {
    // An inline claim outranks every stylesheet, so claiming `light` for `base`
    // would override the `color-scheme` the compiler writes into the artifact's
    // base block -- silently lightening a dark-by-default vertical.
    const view = render(
      <ThemeProvider theme="base" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('base');
    });
    expect(document.documentElement.style.getPropertyValue('color-scheme')).toBe('');

    view.rerender(
      <ThemeProvider theme="dark" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('color-scheme')).toBe('dark');
    });

    view.rerender(
      <ThemeProvider theme="light" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('color-scheme')).toBe('light');
    });

    // Back to base: the claim is released, not overwritten with a value the
    // stylesheet would then lose to.
    view.rerender(
      <ThemeProvider theme="base" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );
    await waitFor(() => {
      expect(document.documentElement.style.getPropertyValue('color-scheme')).toBe('');
    });
  });

  it('fails when the mode block cannot match, which an attribute-only assertion would miss', async () => {
    // The negative drill for the whole file: the attribute is stamped exactly as
    // before, but the artifact is scoped to a tenant this document is not, so
    // nothing the user sees changes. The computed value is what catches it.
    document.documentElement.setAttribute('data-tenant', 'a-different-tenant');

    render(
      <ThemeProvider theme="dark" tenant={FIXTURE_TENANT} skipCssLoading>
        <output>mounted</output>
      </ThemeProvider>,
    );

    await waitFor(() => {
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
    expect(computedInk()).not.toBe(DARK_INK);
  });
});
