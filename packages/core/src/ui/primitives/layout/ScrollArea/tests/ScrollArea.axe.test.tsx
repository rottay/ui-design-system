// @vitest-environment jsdom

/**
 * ScrollArea landmark-law axe proof (K3-C Codex remediation).
 *
 * Codex blocked this family: every instance rendered `role="region"` with
 * the same blanket accessible name ("Scrollable content"), so multiple
 * ScrollAreas on one page were indistinguishable landmarks
 * (axe landmark-unique across the four K3-C cells).
 *
 * The remediated contract, proven here with axe-core:
 *
 *  - UNNAMED instances emit NO `role="region"` and NO accessible name, so
 *    any number of them coexist without a landmark-unique violation (a
 *    scroll container is not a landmark by default).
 *  - A consumer-supplied meaningful name (`aria-label`/`aria-labelledby`)
 *    promotes the root to a named `role="region"` landmark.
 *  - Keyboard reachability (`tabIndex=0`) is unconditional — axe
 *    scrollable-region-focusable requires keyboard reachability, NOT a
 *    region role. jsdom has no layout, so that rule finds no applicable
 *    nodes here (it passes vacuously); the tabIndex assertion is the
 *    DOM-level proof, and the showroom e2e cell covers real-browser
 *    scrolling.
 *
 * The first test is a non-vacuity guard: it proves axe's landmark-unique
 * rule actually evaluates in this environment by showing that two regions
 * with the SAME name (the pre-fix shape) DO trip it.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import axe from 'axe-core';

import ModernScrollArea from '../engines/modern';

async function landmarkViolations(container: HTMLElement) {
  const results = await axe.run(container, {
    runOnly: { type: 'rule', values: ['landmark-unique'] },
  });
  return results.violations;
}

describe('ScrollArea axe landmark-unique', () => {
  it('non-vacuity guard: two regions with the SAME name trip landmark-unique (the pre-fix shape)', async () => {
    const { container } = render(
      <>
        <ModernScrollArea aria-label="Scrollable content">
          <p>First body</p>
        </ModernScrollArea>
        <ModernScrollArea aria-label="Scrollable content">
          <p>Second body</p>
        </ModernScrollArea>
      </>
    );
    const violations = await landmarkViolations(container);
    expect(violations.map((v) => v.id)).toContain('landmark-unique');
  });

  it('multiple unnamed instances produce NO landmark-unique violation (no landmarks at all)', async () => {
    const { container } = render(
      <>
        <ModernScrollArea data-testid="sa-1" maxHeight={120}>
          <p>First body</p>
        </ModernScrollArea>
        <ModernScrollArea data-testid="sa-2" orientation="horizontal" maxWidth="50%">
          <p>Second body</p>
        </ModernScrollArea>
        <ModernScrollArea data-testid="sa-3" orientation="both" maxHeight={120} maxWidth="50%">
          <p>Third body</p>
        </ModernScrollArea>
      </>
    );
    // None of the unnamed instances is a landmark.
    for (const id of ['sa-1', 'sa-2', 'sa-3']) {
      expect(screen.getByTestId(id).getAttribute('role')).toBeNull();
    }
    expect(container.querySelectorAll('[role="region"]')).toHaveLength(0);
    expect(await landmarkViolations(container)).toHaveLength(0);
  });

  it('named instances keep role=region with their distinct names and stay landmark-unique clean', async () => {
    const { container } = render(
      <>
        <ModernScrollArea data-testid="sa-v" aria-label="Candidate rows">
          <p>Vertical body</p>
        </ModernScrollArea>
        <ModernScrollArea data-testid="sa-h" aria-label="Pipeline columns">
          <p>Horizontal body</p>
        </ModernScrollArea>
      </>
    );
    const vertical = screen.getByTestId('sa-v');
    const horizontal = screen.getByTestId('sa-h');
    expect(vertical.getAttribute('role')).toBe('region');
    expect(vertical.getAttribute('aria-label')).toBe('Candidate rows');
    expect(horizontal.getAttribute('role')).toBe('region');
    expect(horizontal.getAttribute('aria-label')).toBe('Pipeline columns');
    expect(await landmarkViolations(container)).toHaveLength(0);
  });
});

describe('ScrollArea axe scrollable-region-focusable', () => {
  it('named and unnamed instances stay keyboard-focusable with no axe violation', async () => {
    const { container } = render(
      <>
        <ModernScrollArea data-testid="sa-named" aria-label="Candidate rows" maxHeight={120}>
          <p>Named body</p>
        </ModernScrollArea>
        <ModernScrollArea data-testid="sa-unnamed" maxHeight={120}>
          <p>Unnamed body</p>
        </ModernScrollArea>
      </>
    );
    // Keyboard reachability is unconditional (DOM-level proof; jsdom has no
    // layout, so axe's scrollability detection is inapplicable here).
    expect(screen.getByTestId('sa-named').tabIndex).toBe(0);
    expect(screen.getByTestId('sa-unnamed').tabIndex).toBe(0);

    const results = await axe.run(container, {
      runOnly: { type: 'rule', values: ['scrollable-region-focusable'] },
    });
    expect(results.violations).toHaveLength(0);
  });
});
