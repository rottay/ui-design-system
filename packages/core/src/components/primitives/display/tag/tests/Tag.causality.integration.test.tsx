/**
 * The tag family in a real browser: the decisions its derived channels consume
 * move a destination's computed style with a negative control, and no gated
 * vertical mode carries a serious axe finding beyond what is pinned.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import ModernTag from '../engines/modern';
import {
  AXE_SCOPES,
  FIRST_PARTY_VERTICALS as VERTICALS,
  auditAxe,
  axeDebt,
  describeCausality,
  measureArms,
  seriousFindings,
} from '@tests/support/family-causality';

type TagProps = React.ComponentProps<typeof ModernTag>;

const tag = (props: Partial<TagProps>, label = 'Ready') =>
  renderToStaticMarkup(<ModernTag {...(props as TagProps)}>{label}</ModernTag>);

const markup = [
  `<div id="solid">${tag({ variant: 'primary' })}</div>`,
  `<div id="outlined">${tag({ variant: 'success', outlined: true }, 'Done')}</div>`,
  `<div id="closable">${tag({ closable: true }, 'Dismiss')}</div>`,
  `<div id="small">${tag({ size: 'sm' }, 'Small')}</div>`,
].join('');

const SOLID = "#solid [data-part='root']";
const CLOSE = "#closable [data-part='close']";

/**
 * MEASURED GAP, registered rather than forced: `shape.radius-scale` reaches
 * NEITHER corner of this family. The close affordance is a pill, whose full
 * radius legitimately never scales; and the chip's own corner resolves through
 * `--ds-tag-radius-md`, an authorable channel the kernel lowers per vertical,
 * which outranks the decision in all three. The derivation lane owns closing
 * that reach; this suite states it rather than pretending it is covered.
 */
describeCausality({
  family: 'tag',
  markup,
  targets: [
    { id: 'solidFill', selector: SOLID, property: 'background-color' },
    { id: 'padInline', selector: SOLID, property: 'padding-left' },
    { id: 'closeCorner', selector: CLOSE, property: 'border-top-left-radius' },
    { id: 'focusRing', selector: SOLID, property: 'box-shadow', attributes: { 'data-state': 'focused focus-visible' } },
  ],
  decisions: {
    'palette.seeds': { value: { primary: '#2F6B9A' }, moves: ['solidFill'], holds: 'padInline', in: VERTICALS },
    'density.mode': { value: 'spacious', moves: ['padInline'], holds: 'closeCorner', in: VERTICALS },
  },
});

/** Measured debt, pinned by node IDENTITY. Registered, never excluded. */
const AXE_DEBT: Record<string, Readonly<Record<string, readonly string[]>>> = {
  // The chip labels do not clear the contrast floor in these scopes. Same class
  // as the table family's: a mode-aware ink derivation is the fix, never an axe
  // exclusion. Pinned by node identity, so a repair or a swap both go red.
  'bithire dark': {
    'color-contrast': ['span[title="Dismiss"]', 'span[title="Done"]', 'span[title="Small"]'],
  },
  'evnto light': { 'color-contrast': ['span[title="Ready"]'] },
};

describe('tag derived channels and accessibility', () => {
  it('derives the tone fill and the pill corners from the family deriver', async () => {
    const result = await measureArms({
      vertical: 'bithire',
      markup,
      arms: { base: {} },
      targets: [
        { id: 'solidFill', selector: SOLID, property: 'background-color' },
        { id: 'outlinedFill', selector: "#outlined [data-part='root']", property: 'background-color' },
        { id: 'closeCorner', selector: CLOSE, property: 'border-top-left-radius' },
        { id: 'fullRadius', selector: SOLID, property: '--ds-radius-full' },
      ],
    });
    const r = result.base!;
    // A solid chip carries a fill; an outlined one leaves the ground showing.
    expect(r.solidFill).not.toBe(r.outlinedFill);
    // The close affordance is a pill: its corner resolves from the full radius.
    expect(Number.parseFloat(r.closeCorner)).toBeGreaterThan(0);
    expect(r.fullRadius.trim().length).toBeGreaterThan(0);
  }, 60_000);

  it('carries no serious axe finding beyond the pinned debt', async () => {
    const measured: Record<string, Readonly<Record<string, readonly string[]>>> = {};
    for (const scope of AXE_SCOPES) {
      const debt = axeDebt(seriousFindings(await auditAxe({ ...scope, markup })));
      if (Object.keys(debt).length > 0) measured[`${scope.vertical} ${scope.theme}`] = debt;
    }
    expect(measured).toEqual(AXE_DEBT);
  }, 180_000);
});
