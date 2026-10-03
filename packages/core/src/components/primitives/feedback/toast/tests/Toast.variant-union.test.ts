import { describe, expectTypeOf, it } from 'vitest';

import type { Variant } from '../../../../../foundation/contracts/kernel/common';
import type { ToastVariant } from '../contracts';

describe('ToastVariant union', () => {
  it('resolves to the same members it had when it was built on the kernel Variant', () => {
    expectTypeOf<ToastVariant>().toEqualTypeOf<Variant | 'info'>();
  });
});
