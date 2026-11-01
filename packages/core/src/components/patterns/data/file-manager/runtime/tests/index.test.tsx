import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

import type { FileManagerProps, PatternFileManagerProps } from '../../contracts';
import {
  admitStringPathOnly,
  hasNonStringSegment,
  pathSegmentLabel,
  pathSegmentTarget,
  refuseInvalidPath,
} from '..';

const received: FileManagerProps[] = [];

function StubFrozenEngine(props: FileManagerProps) {
  received.push(props);
  return <ol data-testid="stub">{(props.currentPath ?? []).map((segment, i) => <li key={i}>{segment}</li>)}</ol>;
}

const baseProps: PatternFileManagerProps = {
  files: [],
  folders: [{ id: 'fld_child', name: 'Drafts', type: 'folder' }],
  viewMode: 'grid',
  emptyMessage: 'Nothing here',
};

afterEach(() => {
  cleanup();
  received.length = 0;
});

describe('segment target and label', () => {
  it('reads the supplied id and name of a segment, never one for the other', () => {
    const segment = { id: 'fld_9f2', name: 'Documents' };
    expect(pathSegmentTarget(segment)).toBe('fld_9f2');
    expect(pathSegmentLabel(segment)).toBe('Documents');
  });

  it('returns a deprecated string unchanged for both', () => {
    expect(pathSegmentTarget('Documents')).toBe('Documents');
    expect(pathSegmentLabel('Documents')).toBe('Documents');
  });
});

describe('refuseInvalidPath', () => {
  it('admits absent, empty, string-only, segment-only and mixed paths', () => {
    expect(refuseInvalidPath(undefined)).toBeUndefined();
    expect(refuseInvalidPath([])).toBeUndefined();
    expect(refuseInvalidPath(['Workspace', ''])).toBeUndefined();
    expect(refuseInvalidPath([{ id: 'a', name: 'A' }, { id: 'a', name: 'A' }])).toBeUndefined();
    expect(refuseInvalidPath(['Workspace', { id: 'b', name: 'B' }])).toBeUndefined();
  });

  it('treats an id as opaque: whitespace and the Root key are not refused', () => {
    expect(refuseInvalidPath([{ id: ' ', name: 'Blank' }])).toBeUndefined();
    expect(refuseInvalidPath([{ id: '__root__', name: 'Imported' }])).toBeUndefined();
  });

  it('refuses an empty id at its index and says it is never read as Root', () => {
    const refusal = refuseInvalidPath(['Workspace', { id: '', name: 'Reports' }]);
    expect(refusal).toMatch(/^currentPath\[1\] is a FileManagerPathSegment with an empty `id`/);
    expect(refusal).toContain('never read as Root');
    expect(refusal).toContain('development and production');
  });

  it.each([
    ['a missing id', [{ name: 'Reports' }]],
    ['a missing name', [{ id: 'fld_1' }]],
    ['a numeric id', [{ id: 7, name: 'Reports' }]],
    ['a null id', [{ id: null, name: 'Reports' }]],
    ['null', [null]],
    ['a number', [42]],
    ['an array', [['fld_1', 'Reports']]],
  ])('refuses %s as malformed', (_label, path) => {
    expect(refuseInvalidPath(path)).toMatch(/^currentPath\[0\] is neither a string nor a FileManagerPathSegment/);
  });
});

describe('hasNonStringSegment', () => {
  it('is false for absent and string-only paths and true for any other element', () => {
    expect(hasNonStringSegment(undefined)).toBe(false);
    expect(hasNonStringSegment(['a', ''])).toBe(false);
    expect(hasNonStringSegment(['a', { id: 'b', name: 'B' }])).toBe(true);
    expect(hasNonStringSegment([null])).toBe(true);
  });
});

describe('admitStringPathOnly (frozen loader adapter)', () => {
  const adapt = admitStringPathOnly('rustic');

  it('names the adapted component after the engine it fronts', () => {
    const { default: Adapted } = adapt({ default: StubFrozenEngine });
    expect(Adapted.displayName).toBe('PatternFileManager(rustic)');
  });

  it('forwards a string-only path as the same strings and every other prop unchanged', () => {
    const { default: Adapted } = adapt({ default: StubFrozenEngine });
    const onNavigate = vi.fn();
    const path = ['Workspace', 'Reports'];
    render(<Adapted {...baseProps} currentPath={path} onNavigate={onNavigate} />);

    expect(screen.getByTestId('stub')).toHaveTextContent('WorkspaceReports');
    expect(received).toHaveLength(1);
    expect(received[0].currentPath).toEqual(path);
    expect(received[0]).toMatchObject({ ...baseProps, onNavigate });
  });

  it('forwards an absent path as absent', () => {
    const { default: Adapted } = adapt({ default: StubFrozenEngine });
    render(<Adapted {...baseProps} />);

    expect(received[0]).not.toHaveProperty('currentPath');
  });

  it('refuses a segment by name instead of passing it or its name to the engine', () => {
    const { default: Adapted } = adapt({ default: StubFrozenEngine });
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      expect(() =>
        render(<Adapted {...baseProps} currentPath={['Workspace', { id: 'fld_a71', name: 'Reports' }]} />)
      ).toThrow('PatternFileManager: the frozen "rustic" engine renders string breadcrumb paths only');
    } finally {
      consoleError.mockRestore();
    }
    expect(received).toHaveLength(0);
  });
});
