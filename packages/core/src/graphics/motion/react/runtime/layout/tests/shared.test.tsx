import React from 'react';
import type { CSSProperties } from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { LayoutGroup, useLayoutAnimation } from '..';
import { mockMatchMedia } from '@tests/support/browser/match-media';

afterEach(() => {
  mockMatchMedia(1280, false);
});

type MorphStyle = CSSProperties & { viewTransitionName?: string; viewTransitionClass?: string };

/** Captures the style object the kernel returns, which is the contract under test. */
function Morph({ recordKey, seen }: { recordKey?: string; seen: MorphStyle[] }) {
  const { style } = useLayoutAnimation({ kind: 'shared', sharedKey: recordKey });
  seen.push(style as MorphStyle);
  return <div style={style} />;
}

describe('useLayoutAnimation({ kind: "shared" })', () => {
  it('declares a record view-transition-name and the morph pairing class', () => {
    const seen: MorphStyle[] = [];
    render(<Morph recordKey="candidate-7" seen={seen} />);

    expect(seen[0].viewTransitionName).toBe('ds-vt-record-candidate-7');
    expect(seen[0].viewTransitionClass).toBe('ds-vt-record');
  });

  it('scopes the name by LayoutGroup id, so two groups can morph the same record key', () => {
    const list: MorphStyle[] = [];
    const detail: MorphStyle[] = [];
    render(
      <>
        <LayoutGroup id="list"><Morph recordKey="7" seen={list} /></LayoutGroup>
        <LayoutGroup id="detail"><Morph recordKey="7" seen={detail} /></LayoutGroup>
      </>,
    );

    expect(list[0].viewTransitionName).toBe('ds-vt-record-list-7');
    expect(detail[0].viewTransitionName).toBe('ds-vt-record-detail-7');
  });

  it('throws on a second live claim of one key, instead of silently disabling the transition', () => {
    const seen: MorphStyle[] = [];
    expect(() => render(
      <LayoutGroup id="list">
        <Morph recordKey="7" seen={seen} />
        <Morph recordKey="7" seen={seen} />
      </LayoutGroup>,
    )).toThrow(/already live/);
  });

  it('emits no name when the call site names no key', () => {
    const seen: MorphStyle[] = [];
    render(<Morph seen={seen} />);

    expect(seen[0].viewTransitionName).toBeUndefined();
    expect(Object.keys(seen[0])).toHaveLength(0);
  });
});
