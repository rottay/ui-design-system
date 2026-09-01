import { describe, expectTypeOf, it } from 'vitest';

import type {
  WidgetBoardHeader,
  WidgetBoardItem,
  WidgetBoardResizeAxes,
} from '../../../../../index';

describe('public widget board api', () => {
  it('exports the item header contract from the package root', () => {
    expectTypeOf<WidgetBoardItem['header']>().toEqualTypeOf<
      WidgetBoardHeader | undefined
    >();
  });

  /* The axis type is named in the public item contract, so the root must export it too. */
  it('exports the resize-axis contract from the package root', () => {
    expectTypeOf<WidgetBoardItem['resizable']>().toEqualTypeOf<
      boolean | WidgetBoardResizeAxes | undefined
    >();
    expectTypeOf<WidgetBoardResizeAxes['inline']>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<WidgetBoardResizeAxes['block']>().toEqualTypeOf<
      boolean | undefined
    >();
  });

  it('exports the movable and removable constraints from the package root', () => {
    expectTypeOf<WidgetBoardItem['movable']>().toEqualTypeOf<
      boolean | undefined
    >();
    expectTypeOf<WidgetBoardItem['removable']>().toEqualTypeOf<
      boolean | undefined
    >();
  });
});
