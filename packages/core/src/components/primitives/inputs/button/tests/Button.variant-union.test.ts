import { describe, expectTypeOf, it } from 'vitest';

import type { Variant } from '../../../../../foundation/contracts/kernel/common';
import type { ButtonProps, ButtonVariant } from '../contracts';

describe('ButtonVariant union', () => {
  it('resolves to the same members it had when it was built on the kernel Variant', () => {
    expectTypeOf<ButtonVariant>().toEqualTypeOf<
      Variant | 'outline' | 'info' | 'text' | 'link' | 'ghost' | 'dashed' | 'danger' | 'ai'
    >();
    expectTypeOf<NonNullable<ButtonProps['variant']>>().toEqualTypeOf<ButtonVariant>();
  });
});
