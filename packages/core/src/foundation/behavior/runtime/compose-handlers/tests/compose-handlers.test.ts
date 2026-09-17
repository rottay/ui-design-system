/**
 * @fileoverview A composed handler runs both sides, in order, and stops on
 * `preventDefault` (WO-FAM-00).
 */

import { describe, expect, it, vi } from 'vitest';

import { composeHandlers } from '..';

describe('composeHandlers', () => {
  it('calls both handlers, first then second', () => {
    const order: string[] = [];
    const composed = composeHandlers(
      () => order.push('first'),
      () => order.push('second')
    );
    composed({ defaultPrevented: false });
    expect(order).toEqual(['first', 'second']);
  });

  it('skips the second handler when the first prevented the default', () => {
    const second = vi.fn();
    const composed = composeHandlers((event: { defaultPrevented: boolean }) => {
      event.defaultPrevented = true;
    }, second);
    composed({ defaultPrevented: false });
    expect(second).not.toHaveBeenCalled();
  });

  it('still calls the second handler when only one side exists', () => {
    const second = vi.fn();
    composeHandlers<{ defaultPrevented?: boolean }>(undefined, second)({});
    expect(second).toHaveBeenCalledTimes(1);

    const first = vi.fn();
    composeHandlers<{ defaultPrevented?: boolean }>(first, undefined)({});
    expect(first).toHaveBeenCalledTimes(1);
  });

  it('passes the same event object to both sides', () => {
    const event = { defaultPrevented: false };
    const first = vi.fn();
    const second = vi.fn();
    composeHandlers(first, second)(event);
    expect(first).toHaveBeenCalledWith(event);
    expect(second).toHaveBeenCalledWith(event);
  });
});
