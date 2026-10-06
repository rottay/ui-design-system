import { createRef } from 'react';
import { describe, expectTypeOf, it } from 'vitest';

import type {
  PopoverAnchoredProps,
  PopoverProps,
  PopoverTriggerProps,
} from '../contracts';

const anchor = createRef<HTMLButtonElement>();

describe('Popover props union', () => {
  it('destructures every key of both arms over the union, as the frozen engines do', () => {
    const read = (props: PopoverProps) => {
      const { trigger, arrow, zIndex, children, title, className, style, anchor: ref, id, initialFocus } = props;
      return { trigger, arrow, zIndex, children, title, className, style, ref, id, initialFocus };
    };
    expectTypeOf(read).parameter(0).toEqualTypeOf<PopoverProps>();
  });

  it('accepts a caller-owned element ref with either accessible name', () => {
    expectTypeOf({
      anchor,
      open: true,
      onOpenChange: (_open: boolean) => {},
      id: 'filters',
      'aria-label': 'Filters',
      content: 'Body',
    }).toMatchTypeOf<PopoverAnchoredProps>();
    expectTypeOf({
      anchor,
      open: true,
      onOpenChange: (_open: boolean) => {},
      id: 'filters',
      'aria-labelledby': 'filters-label',
      content: 'Body',
    }).toMatchTypeOf<PopoverAnchoredProps>();
  });

  it('refuses the shapes the anchored mode forbids', () => {
    // @ts-expect-error -- an anchored Popover takes no trigger child.
    const withChildren: PopoverProps = { anchor, open: true, onOpenChange: () => {}, id: 'a', 'aria-label': 'A', content: 'B', children: 'Trigger' };
    // @ts-expect-error -- an anchored Popover must be named.
    const unnamed: PopoverProps = { anchor, open: true, onOpenChange: () => {}, id: 'a', content: 'B' };
    // @ts-expect-error -- an anchored Popover is controlled and needs its id.
    const uncontrolled: PopoverProps = { anchor, 'aria-label': 'A', content: 'B' };
    // @ts-expect-error -- a selector is never an anchor.
    const selector: PopoverProps = { anchor: '#filters', open: true, onOpenChange: () => {}, id: 'a', 'aria-label': 'A', content: 'B' };
    // @ts-expect-error -- trigger-only keys are `never` on the anchored arm.
    const withArrow: PopoverAnchoredProps = { anchor, open: true, onOpenChange: () => {}, id: 'a', 'aria-label': 'A', content: 'B', arrow: true };
    void [withChildren, unnamed, uncontrolled, selector, withArrow];
  });

  it('keeps the trigger arm byte-compatible', () => {
    expectTypeOf({ content: 'Body', children: 'Trigger', trigger: 'click' as const }).toMatchTypeOf<PopoverTriggerProps>();
    // @ts-expect-error -- the trigger arm has no anchor.
    const triggerWithAnchor: PopoverTriggerProps = { content: 'Body', children: 'Trigger', anchor };
    void triggerWithAnchor;
  });
});
