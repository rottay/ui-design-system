import { describe, expect, it } from 'vitest';

import { getCollapseSlotTokens, getCollapseTokens } from '..';

describe('collapse token utils', () => {
  it('builds computed root tokens from default options', () => {
    expect(getCollapseTokens()).toMatchObject({
      '--ds-collapse-variant': 'default',
      '--ds-collapse-size': 'middle',
      '--ds-collapse-icon-position': 'start',
      '--ds-collapse-disabled': '0',
      '--ds-collapse-expanded': '0',
      '--ds-collapse-root-bg': 'var(--ds-collapse-root-default-idle-bg)',
    });
  });

  it('prioritizes ghost and bordered flags when resolving the effective variant', () => {
    expect(getCollapseTokens({ variant: 'default', ghost: true })).toMatchObject({
      '--ds-collapse-variant': 'ghost',
      '--ds-collapse-root-bg': 'var(--ds-collapse-root-ghost-idle-bg)',
    });

    expect(getCollapseTokens({ variant: 'default', bordered: true })).toMatchObject({
      '--ds-collapse-variant': 'bordered',
      '--ds-collapse-root-border-color': 'var(--ds-collapse-root-bordered-idle-border-color)',
    });
  });

  it('returns slot-specific styles for expanded, disabled and default states', () => {
    expect(getCollapseSlotTokens('root', { variant: 'bordered' })).toMatchObject({
      background: 'var(--ds-collapse-root-bordered-idle-bg)',
      borderStyle: 'var(--ds-collapse-root-bordered-idle-border-style)',
    });

    expect(getCollapseSlotTokens('header', { expanded: true })).toMatchObject({
      background: 'var(--ds-collapse-header-default-expanded-bg, var(--ds-collapse-header-default-idle-bg))',
      color: 'var(--ds-collapse-header-default-expanded-color, var(--ds-collapse-header-default-idle-color))',
      cursor: 'pointer',
    });

    expect(getCollapseSlotTokens('header', { disabled: true, ghost: true })).toMatchObject({
      background: 'var(--ds-collapse-header-ghost-disabled-bg, var(--ds-collapse-header-ghost-idle-bg))',
      color: 'var(--ds-collapse-header-ghost-disabled-color, var(--ds-collapse-header-ghost-idle-color))',
      cursor: 'not-allowed',
      opacity: 'var(--ds-collapse-header-ghost-disabled-opacity, 0.6)',
    });

    expect(getCollapseSlotTokens('content', { variant: 'ghost' })).toMatchObject({
      background: 'var(--ds-collapse-content-ghost-idle-bg)',
      color: 'var(--ds-collapse-content-ghost-idle-color)',
    });

    expect(getCollapseSlotTokens('icon', { expanded: true })).toMatchObject({
      color: 'var(--ds-collapse-icon-default-expanded-color)',
      transform: 'var(--ds-collapse-icon-default-expanded-transform)',
    });

    expect(getCollapseSlotTokens('unknown' as never, {})).toEqual({});
  });
});
