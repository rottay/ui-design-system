/**
 * Shared coarse-pointer touch floor contract.
 *
 * The 44px hit-area law is enforced in two places by design:
 *
 *   1. ONE shared unlayered rule in `facade/entrypoints/base.css`, which reaches
 *      every control that publishes a tag or ARIA role — no per-component edit;
 *   2. per-component floors on controls whose role sits on a small indicator
 *      (checkbox/radio/switch/slider) or inside virtualized geometry (option,
 *      row), where a shared visual-size floor would redesign the control.
 *
 * This gate pins the shared half: its selector coverage is decrease-only, its
 * placement stays unlayered, and its value stays a physical pixel length.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const baseCss = source('src/foundation/tokens/css/facade/entrypoints/base.css');
const defaultThemeCss = source('src/foundation/tokens/css/foundation/themes/default.css');

const FLOOR_VARIABLE = '--ds-touch-target-min';

/** The single `@media (pointer: coarse)` floor block declared by base.css. */
const floorBlock = baseCss.match(
  /@media \(pointer: coarse\) \{[\s\S]*?\n\}/,
)?.[0];

/** Controls the shared rule is required to reach. */
const COVERED_SELECTORS = [
  'button',
  '[role="button"]',
  'a',
  '[data-ds-interactive="true"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'select',
  '[role="combobox"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="menuitemcheckbox"]',
  '[role="menuitemradio"]',
  'summary',
] as const;

/**
 * Roles the shared rule must NOT claim: the role sits on an indicator or thumb,
 * or inside virtualized geometry, so a shared visual floor would change the
 * control's design instead of its hit area.
 */
const COMPONENT_OWNED_ROLES = [
  '[role="checkbox"]',
  '[role="radio"]',
  '[role="switch"]',
  '[role="slider"]',
  '[role="option"]',
  '[role="row"]',
] as const;

describe('shared coarse-pointer touch floor', () => {
  it('declares one unlayered floor rule driven by the shared channel', () => {
    expect(floorBlock).toBeDefined();
    expect(floorBlock).toContain(`min-height: var(${FLOOR_VARIABLE});`);
    expect(floorBlock).toContain(`min-width: var(${FLOOR_VARIABLE});`);
    // Unlayered: the block must not be nested inside an @layer, otherwise any
    // skin in `rottay-engines` overrides it with its own min-block-size.
    const beforeBlock = baseCss.slice(0, baseCss.indexOf(floorBlock!));
    expect(beforeBlock).not.toMatch(/@layer\s+[\w-]+\s*\{[^}]*$/);
  });

  it('reaches every tag and role the shared rule owns', () => {
    for (const selector of COVERED_SELECTORS) {
      expect(floorBlock).toContain(selector);
    }
  });

  it('leaves indicator and virtualized roles to their component floors', () => {
    for (const role of COMPONENT_OWNED_ROLES) {
      expect(floorBlock).not.toContain(role);
    }
  });

  it('keeps the floor a physical pixel length, never a rem', () => {
    // The DS root font-size is fluid and resolves to 15px at narrow widths, so
    // 2.75rem silently becomes 41.25px exactly where the law matters.
    const declaration = defaultThemeCss.match(
      new RegExp(`${FLOOR_VARIABLE}:\\s*([^;]+);`),
    );
    expect(declaration).not.toBeNull();
    expect(declaration![1].trim()).toBe('44px');
  });
});
