import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { LAYOUT_CHANNEL_DEFAULTS } from '..';

/**
 * WO-INV-05's lesson: thirteen modern animations were invalid wherever a channel
 * was declared only inside the reduced-motion block. Every channel this kernel
 * reads must therefore carry a RESTING value in the base sheet, not only in a
 * compiled tenant artifact.
 */
const BASE_SHEET = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../../../foundation/tokens/css/foundation/animations/transitions/index.css',
);

/** The sheet with every `prefers-reduced-motion` block removed. */
function restingDeclarations(): string {
  const css = readFileSync(BASE_SHEET, 'utf8');
  let out = '';
  let index = 0;
  for (;;) {
    const at = css.indexOf('@media (prefers-reduced-motion', index);
    if (at === -1) {
      out += css.slice(index);
      return out;
    }
    out += css.slice(index, at);
    let depth = 0;
    let cursor = css.indexOf('{', at);
    for (; cursor < css.length; cursor += 1) {
      if (css[cursor] === '{') depth += 1;
      else if (css[cursor] === '}') {
        depth -= 1;
        if (depth === 0) break;
      }
    }
    index = cursor + 1;
  }
}

describe('layout kernel channel defaults', () => {
  const channels = [...new Set(
    Object.values(LAYOUT_CHANNEL_DEFAULTS).flatMap((pair) => [pair.durationVar, pair.easingVar]),
  )];

  it('names a move channel for every timed kind, and no numeric cadence', () => {
    expect(LAYOUT_CHANNEL_DEFAULTS).toEqual({
      reflow: { durationVar: '--ds-motion-rearrange', easingVar: '--ds-motion-ease-move' },
      size: { durationVar: '--ds-motion-resize', easingVar: '--ds-motion-ease-move' },
      shared: { durationVar: '--ds-motion-rearrange', easingVar: '--ds-motion-ease-move' },
    });
    expect(channels.every((channel) => channel.startsWith('--ds-motion-'))).toBe(true);
    // A non-vacuity floor: the roster is the one the kernel actually reads.
    expect(channels).toHaveLength(3);
  });

  it('declares every channel it reads at rest in the base sheet, outside the reduce block', () => {
    const resting = restingDeclarations();
    for (const channel of channels) {
      expect(resting, `${channel} has no resting declaration`).toContain(`${channel}:`);
    }
  });

  it('does not read the calm/ease-out pair a move is not', () => {
    expect(channels).not.toContain('--ds-motion-normal');
    expect(channels).not.toContain('--ds-motion-ease-out');
  });
});
