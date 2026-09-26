import React, { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  useDragSession,
  useResizeSession,
  type ResizeEdge,
  type ResizeIntent,
  type ResizeStep,
  type UseResizeSessionResult,
} from '../index';

type Api = UseResizeSessionResult<string>;

interface HarnessProps {
  readonly edge?: ResizeEdge;
  readonly step?: ResizeStep;
  readonly measureStep?: (subject: string, edge: ResizeEdge) => ResizeStep;
  readonly onCommit?: (subject: string, intent: ResizeIntent) => void;
  readonly onCancel?: (subject: string) => void;
  readonly disabled?: boolean;
  readonly eligible?: boolean;
  readonly observe?: (api: Api) => void;
}

function Harness({
  edge = 'inline-end',
  step = { inline: 80, block: 1 },
  measureStep,
  onCommit = () => {},
  onCancel,
  disabled,
  eligible,
  observe,
}: HarnessProps) {
  const api = useResizeSession<string>({
    measureStep: measureStep ?? (() => step),
    onCommit,
    onCancel,
    disabled,
  });
  observe?.(api);
  return <button type="button" data-testid="handle" {...api.getHandleProps('w1', edge, { eligible })} />;
}

const down = (x = 100, y = 100) =>
  fireEvent.pointerDown(screen.getByTestId('handle'), { pointerId: 3, clientX: x, clientY: y });
const move = (x: number, y = 100) => fireEvent.pointerMove(window, { pointerId: 3, clientX: x, clientY: y });
const up = (x: number, y = 100) => fireEvent.pointerUp(window, { pointerId: 3, clientX: x, clientY: y });

describe('useResizeSession: the resize intent over the pointer transport', () => {
  it('previews the intent from the press, measured once, and commits it once at release', () => {
    let api!: Api;
    const onCommit = vi.fn();
    const measureStep = vi.fn(() => ({ inline: 80, block: 1 }));
    render(<Harness measureStep={measureStep} onCommit={onCommit} observe={(next) => (api = next)} />);

    down(100, 100);
    expect(api.resize).toEqual({
      subject: 'w1',
      edge: 'inline-end',
      delta: { x: 0, y: 0 },
      intent: { edge: 'inline-end', inline: 0, block: 0 },
    });
    move(230, 140);
    expect(api.resize?.intent).toEqual({ edge: 'inline-end', inline: 2, block: 0 });
    expect(api.resize?.delta).toEqual({ x: 130, y: 40 });
    expect(onCommit).not.toHaveBeenCalled();

    up(230, 140);
    up(230, 140);
    expect(measureStep).toHaveBeenCalledTimes(1);
    expect(measureStep).toHaveBeenCalledWith('w1', 'inline-end');
    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith('w1', { edge: 'inline-end', inline: 2, block: 0 });
    expect(api.resize).toBeNull();
  });

  it('a corner resizes both axes; the block axis in px when the step is 1', () => {
    const onCommit = vi.fn();
    render(<Harness edge="block-end-inline-start" onCommit={onCommit} />);
    down(100, 100);
    move(-60, 137);
    up(-60, 137);
    expect(onCommit).toHaveBeenCalledWith('w1', { edge: 'block-end-inline-start', inline: 2, block: 37 });
  });

  it('a release that moves no axis commits nothing', () => {
    const onCommit = vi.fn();
    const onCancel = vi.fn();
    render(<Harness onCommit={onCommit} onCancel={onCancel} />);
    down(100, 100);
    move(130, 400);
    up(130, 400);
    expect(onCommit).not.toHaveBeenCalled();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('Escape and pointercancel abandon the resize with onCancel and no commit', () => {
    for (const abort of [
      () => fireEvent.keyDown(window, { key: 'Escape' }),
      () => fireEvent.pointerCancel(window, { pointerId: 3 }),
    ]) {
      let api!: Api;
      const onCommit = vi.fn();
      const onCancel = vi.fn();
      const { unmount } = render(<Harness onCommit={onCommit} onCancel={onCancel} observe={(next) => (api = next)} />);
      down(100, 100);
      move(400, 100);
      abort();
      up(400, 100);
      expect(onCancel).toHaveBeenCalledWith('w1');
      expect(onCommit).not.toHaveBeenCalled();
      expect(api.resize).toBeNull();
      unmount();
    }
  });

  it('cancel() and disabling mid-press abandon it too', () => {
    let api!: Api;
    const onCommit = vi.fn();
    const onCancel = vi.fn();
    render(<Harness onCommit={onCommit} onCancel={onCancel} observe={(next) => (api = next)} />);
    down(100, 100);
    move(400, 100);
    act(() => api.cancel());
    up(400, 100);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();

    const toggled = vi.fn();
    const committed = vi.fn();
    function Toggle() {
      const [disabled, setDisabled] = useState(false);
      return (
        <>
          <Harness disabled={disabled} onCancel={toggled} onCommit={committed} />
          <button type="button" data-testid="off" onClick={() => setDisabled(true)} />
        </>
      );
    }
    render(<Toggle />);
    fireEvent.pointerDown(screen.getAllByTestId('handle')[1]!, { pointerId: 3, clientX: 100, clientY: 100 });
    move(400, 100);
    fireEvent.click(screen.getByTestId('off'));
    up(400, 100);
    expect(toggled).toHaveBeenCalledTimes(1);
    expect(committed).not.toHaveBeenCalled();
  });

  it('an ineligible or disabled handle carries no handler', () => {
    for (const props of [{ eligible: false }, { disabled: true }] as HarnessProps[]) {
      let api!: Api;
      const { unmount } = render(<Harness {...props} observe={(next) => (api = next)} />);
      expect(api.getHandleProps('w1', 'inline-end', { eligible: props.eligible })).toEqual({});
      unmount();
    }
  });

  it('a handle inside a pointer-transport source never also starts the move', () => {
    const onDragStarted = vi.fn();
    const onCommit = vi.fn();
    function Cell() {
      const drag = useDragSession<{ key: string }, { key: string }>({
        onDrop: () => {},
        onDragStarted,
        pointer: { resolvePointerTarget: () => ({ key: 'slot' }) },
      });
      const resize = useResizeSession<string>({ measureStep: () => ({ inline: 80, block: 1 }), onCommit });
      return (
        <div data-testid="cell" {...drag.getPointerSourceProps({ key: 'w1' })}>
          <button type="button" data-testid="edge" {...resize.getHandleProps('w1', 'inline-end')} />
        </div>
      );
    }
    render(<Cell />);
    fireEvent.pointerDown(screen.getByTestId('edge'), { pointerId: 3, clientX: 100, clientY: 100 });
    move(260, 100);
    up(260, 100);
    expect(onDragStarted).not.toHaveBeenCalled();
    expect(onCommit).toHaveBeenCalledWith('w1', { edge: 'inline-end', inline: 2, block: 0 });
  });
});
