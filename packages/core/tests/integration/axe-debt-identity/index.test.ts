/**
 * The debt comparator survives a same-count substitution.
 *
 * EVI-02 (audit d6-main-2026-09-15 §3): the axe debt pins were `rule:nodeCount`
 * per scope, which detects a new rule, a bigger count and a clean scope going
 * dirty -- but NOT the one move that leaves the count alone. Repair one pinned
 * node, break a different previously-good node under the same rule, and the
 * count is unchanged, so a counting pin stays green while the set of failing
 * nodes is completely different.
 *
 * This drill plants exactly that substitution against the real harness and
 * proves two things at once: the counting comparator accepts it, and the
 * identity comparator refuses it. It is the executable form of the audit's
 * source argument, so a future simplification back to counts fails here.
 */
import { describe, expect, it } from 'vitest';

import { auditAxe, axeDebt, seriousFindings } from '@tests/support/family-causality';

/** Ink that cannot be read on white; axe measures it at ~1.1:1. */
const UNREADABLE = 'color: #f3f4f6; background: #ffffff;';
/** Ink that clears the floor on the same ground. */
const READABLE = 'color: #111827; background: #ffffff;';

const paragraph = (id: string, style: string) =>
  `<p id="${id}" style="${style} font-size: 14px;">${id} copy</p>`;

/** alpha fails, beta passes. */
const PINNED = `${paragraph('alpha', UNREADABLE)}${paragraph('beta', READABLE)}`;
/** The substitution: alpha repaired, beta broken. Same rule, same node COUNT. */
const SUBSTITUTED = `${paragraph('alpha', READABLE)}${paragraph('beta', UNREADABLE)}`;

const SCOPE = { vertical: 'bithire', theme: 'light' } as const;

const countOnly = (findings: readonly { id: string; nodes: number }[]) =>
  findings.map((finding) => `${finding.id}:${finding.nodes}`);

describe('axe debt pins are identities, not counts', () => {
  it('refuses a same-count substitution that a counting pin accepts', async () => {
    const pinned = seriousFindings(await auditAxe({ ...SCOPE, markup: PINNED }));
    const substituted = seriousFindings(await auditAxe({ ...SCOPE, markup: SUBSTITUTED }));

    // The planted premise: one contrast node on each side, so the substitution
    // is a real swap rather than a count change dressed up as one.
    expect(axeDebt(pinned)).toEqual({ 'color-contrast': ['#alpha'] });
    expect(axeDebt(substituted)).toEqual({ 'color-contrast': ['#beta'] });

    // What the OLD comparator saw: identical. This is the hole, executed.
    expect(countOnly(substituted)).toEqual(countOnly(pinned));

    // What the comparator sees now: a different set, so the pin goes red.
    expect(axeDebt(substituted)).not.toEqual(axeDebt(pinned));
  }, 240_000);

  it('still refuses a repaired node and a new node, in both directions', async () => {
    const pinned = axeDebt(seriousFindings(await auditAxe({ ...SCOPE, markup: PINNED })));

    // Debt IMPROVING is still a change that must be re-adjudicated, not a
    // silent pass: a pin that only forbids growth would accept this.
    const repaired = axeDebt(
      seriousFindings(await auditAxe({ ...SCOPE, markup: paragraph('alpha', READABLE) })),
    );
    expect(repaired).toEqual({});
    expect(repaired).not.toEqual(pinned);

    // And one more failing node fails too, which the count already caught.
    const grown = axeDebt(
      seriousFindings(await auditAxe({ ...SCOPE, markup: `${PINNED}${paragraph('gamma', UNREADABLE)}` })),
    );
    expect(grown).toEqual({ 'color-contrast': ['#alpha', '#gamma'] });
    expect(grown).not.toEqual(pinned);
  }, 240_000);
});
