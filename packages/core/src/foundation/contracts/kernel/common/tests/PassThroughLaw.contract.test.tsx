/**
 * Pass-through law contract (P-88) for `BaseComponentProps`: the type accepts
 * `data-part` everywhere, but only a structural component with no part of its
 * own forwards it. A skinned component keeps its canonical part, and the caller
 * value reaches no element it paints; `className` is the composition door. The
 * same holds for `data-state`, which the runtime does not honour yet: those cases
 * are `it.fails` debt pins that turn red the day the fix lands.
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import ClassicCard from '@/components/primitives/display/card/engines/classic';
import ModernCard from '@/components/primitives/display/card/engines/modern';
import RusticCard from '@/components/primitives/display/card/engines/rustic';
import ModernSelect from '@/components/primitives/inputs/select/engines/modern';
import { VisuallyHidden } from '@/components/primitives/foundation/visually-hidden';

const CALLER_PART = 'p88-caller-part';
const CALLER_STATE = 'p88-caller-state';
const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Bravo' },
];

describe('P-88 pass-through law', () => {
  it.each([
    ['classic', ClassicCard, '.rottay-card--classic'],
    ['modern', ModernCard, '.ds-card--modern'],
    ['rustic', RusticCard, '.rottay-card--rustic'],
  ] as const)('%s Card keeps its root part, drops the caller part and lands the caller class', (_engine, Card, rootSelector) => {
    const { container } = render(
      <Card title="Card" className="caller-hook" data-part={CALLER_PART} data-custom="caller-data">
        Content
      </Card>
    );
    const root = container.querySelector(rootSelector) as HTMLElement;
    expect(root).toHaveAttribute('data-part', 'root');
    expect(root).toHaveClass('caller-hook');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
  });

  it('modern Select keeps its trigger part on both paths and drops the caller part', () => {
    const native = render(<ModernSelect data-part={CALLER_PART} options={OPTIONS} />);
    expect(native.container.querySelector('select')).toHaveAttribute('data-part', 'trigger');
    expect(native.container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    native.unmount();

    const custom = render(<ModernSelect data-part={CALLER_PART} searchable options={OPTIONS} />);
    expect(custom.container.querySelector('[role="combobox"]')).toHaveAttribute('data-part', 'trigger');
    expect(custom.container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
  });

  it('a structural component with no part of its own forwards the caller part', () => {
    const { container } = render(<VisuallyHidden data-part={CALLER_PART}>Label</VisuallyHidden>);
    expect(container.querySelector('.ds-visually-hidden')).toHaveAttribute('data-part', CALLER_PART);
  });

  it.fails.each([
    ['classic', ClassicCard, '.rottay-card--classic'],
    ['modern', ModernCard, '.ds-card--modern'],
    ['rustic', RusticCard, '.rottay-card--rustic'],
  ] as const)('KNOWN DEBT (ARC-12): %s Card should not forward a resting caller data-state', (_engine, Card, rootSelector) => {
    const { container } = render(
      <Card title="Card" data-state={CALLER_STATE}>
        Content
      </Card>
    );
    expect(container.querySelector(rootSelector)).not.toHaveAttribute('data-state', CALLER_STATE);
  });

  it.fails('KNOWN DEBT (ARC-12): modern Select should not forward a resting caller data-state to its trigger', () => {
    const { container } = render(<ModernSelect data-state={CALLER_STATE} options={OPTIONS} />);
    expect(container.querySelector('select')).not.toHaveAttribute('data-state', CALLER_STATE);
  });

  it.fails('KNOWN DEBT (ARC-12): modern Select should not forward a resting caller data-state to its custom trigger', () => {
    const { container } = render(<ModernSelect data-state={CALLER_STATE} searchable options={OPTIONS} />);
    expect(container.querySelector('[role="combobox"]')).not.toHaveAttribute('data-state', CALLER_STATE);
  });
});
