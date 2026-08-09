import { describe, expectTypeOf, it } from 'vitest';

import type {
  WidgetBoardHeader,
  WidgetBoardItem,
} from '../../../../../index';

describe('public widget board api', () => {
  it('exports the item header contract from the package root', () => {
    expectTypeOf<WidgetBoardItem['header']>().toEqualTypeOf<
      WidgetBoardHeader | undefined
    >();
  });
});
