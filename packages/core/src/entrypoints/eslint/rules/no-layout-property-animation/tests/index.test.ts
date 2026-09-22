import { describe, expect, it } from 'vitest';

import { noLayoutPropertyAnimation } from '..';

function visitors(filename = '/repo/src/components/primitives/display/card/engines/modern/index.tsx') {
  const reports: Array<{ messageId?: string }> = [];
  const created = noLayoutPropertyAnimation.create({
    filename,
    options: [],
    report: (descriptor) => reports.push(descriptor),
  });
  return { created, reports };
}

/** A string literal as the value of `key: <value>`. */
function styleValue(key: string, value: string) {
  const property: any = { type: 'Property', computed: false, key: { type: 'Identifier', name: key } };
  const literal: any = { type: 'Literal', value, parent: property };
  property.value = literal;
  return literal;
}

/** A string literal as the right-hand side of `style.<key> = <value>`. */
function assignedValue(key: string, value: string) {
  const assignment: any = {
    type: 'AssignmentExpression',
    left: { type: 'MemberExpression', computed: false, property: { type: 'Identifier', name: key } },
  };
  const literal: any = { type: 'Literal', value, parent: assignment };
  assignment.right = literal;
  return literal;
}

const COMPOUND = '/repo/src/components/primitives/feedback/progress/compound/line/index.tsx';
const RUNTIME_PRESENTATION = '/repo/src/components/primitives/layout/stack/runtime/presentation/index.ts';
const KERNEL = '/repo/src/graphics/motion/react/runtime/layout/runtime/size/index.ts';

describe('no-layout-property-animation', () => {
  it('blocks a layout property named first in a transition value', () => {
    const { created, reports } = visitors();
    created.Literal?.(styleValue('transition', 'height 200ms'));
    created.Literal?.(styleValue('transition', 'opacity .2s, inline-size .2s'));
    created.Literal?.(styleValue('transitionProperty', 'width'));
    expect(reports.map((report) => report.messageId)).toEqual([
      'layoutProperty',
      'layoutProperty',
      'layoutProperty',
    ]);
  });

  it('blocks `transition: all`, which contains every layout property', () => {
    const { created, reports } = visitors();
    created.Literal?.(styleValue('transition', 'all var(--ds-motion-fast)'));
    expect(reports.map((report) => report.messageId)).toEqual(['transitionAll']);
  });

  it('blocks a --ds-transition-* alias that expands to size legs, wherever it is written', () => {
    const { created, reports } = visitors(RUNTIME_PRESENTATION);
    created.Literal?.(assignedValue('transition', 'var(--ds-transition-rearrange)'));
    created.Literal?.(assignedValue('transition', 'var(--ds-transition-resize)'));
    expect(reports.map((report) => report.messageId)).toEqual(['layoutAlias', 'layoutAlias']);
  });

  it('blocks a layout property declared inside inline @keyframes text', () => {
    const { created, reports } = visitors();
    created.TemplateElement?.({ value: { cooked: '@keyframes x { to { max-height: 0 } }' } });
    expect(reports.map((report) => report.messageId)).toEqual(['layoutKeyframe']);
  });

  it('reaches the two shapes the engines/modern subject could not see', () => {
    // The `compound/` body: an engine-shared component, publicly exported.
    const compound = visitors(COMPOUND);
    compound.created.Literal?.(styleValue('transition', 'width 0.3s ease'));
    expect(compound.reports.map((report) => report.messageId)).toEqual(['layoutProperty']);

    // The `runtime/presentation/` inline writer.
    const writer = visitors(RUNTIME_PRESENTATION);
    writer.created.Literal?.(styleValue('transition', 'block-size var(--ds-motion-resize)'));
    expect(writer.reports.map((report) => report.messageId)).toEqual(['layoutProperty']);
  });

  it('accepts compositor-only motion, and the kernel owning size', () => {
    const { created, reports } = visitors();
    created.Literal?.(styleValue('transition', 'transform var(--ds-motion-rearrange) var(--ds-motion-ease-move)'));
    created.Literal?.(styleValue('transition', 'opacity var(--ds-motion-reveal)'));
    created.Literal?.(styleValue('transition', 'clip-path var(--ds-motion-reveal)'));
    created.Literal?.(styleValue('content', 'height 200ms'));
    expect(reports).toEqual([]);

    const kernel = visitors(KERNEL);
    expect(Object.keys(kernel.created)).toEqual([]);
  });

  it('does not run in the frozen engines', () => {
    const classic = visitors('/repo/src/components/primitives/display/card/engines/classic/index.tsx');
    expect(Object.keys(classic.created)).toEqual([]);
    const rustic = visitors('/repo/src/components/primitives/display/card/engines/rustic/index.tsx');
    expect(Object.keys(rustic.created)).toEqual([]);
  });

  it('publishes one token list, so Arm B cannot drift from it', async () => {
    const { LAYOUT_PROPERTY_TOKENS } = await import('..');
    expect(LAYOUT_PROPERTY_TOKENS).toContain('inline-size');
    expect(LAYOUT_PROPERTY_TOKENS).toContain('grid-template-columns');
    expect(new Set(LAYOUT_PROPERTY_TOKENS).size).toBe(LAYOUT_PROPERTY_TOKENS.length);
  });
});
