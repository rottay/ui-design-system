/**
 * @fileoverview The pointer-session Chromium scene.
 *
 * A neutral 3 x 2 grid of slots, each with a move handle on the kernel's
 * pointer transport and an inline-end resize handle on `useResizeSession`. The
 * consumer measures the slot rects and hands them to `resolveGridSlot`, which
 * is the division of labour the kernel promises: it resolves, the consumer
 * measures and paints. The same move handle carries the kernel's `'grab'`
 * keyboard mode, so one runner drives both a real pointer and a real keyboard.
 *
 * The scene records into a module-level log published on `window`, and the
 * runner asserts against it.
 */

import React, { useEffect, useRef } from 'react';

import { resolveGridSlot, useDragSession, useResizeSession, type SlotRect } from '../../../index';

type Payload = { key: string; slot: number };
type Destination = { slot: number };

const SLOTS = 6;
const COLUMNS = 3;
const SLOT = { width: 120, height: 80, gap: 16 };

interface SceneRecord {
  readonly commits: Array<{ key: string; slot: number }>;
  readonly resizes: Array<{ subject: string; inline: number; block: number }>;
  readonly announcements: string[];
  readonly previews: Array<{ key: string; slot: number | null; dx: number; dy: number }>;
  readonly cancels: string[];
}

const record: SceneRecord = { commits: [], resizes: [], announcements: [], previews: [], cancels: [] };

declare global {
  interface Window {
    __pointerScene?: SceneRecord;
  }
}

export function PointerSessionScene(): React.JSX.Element {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  const measure = (): { slots: SlotRect[]; bounds: SlotRect } | null => {
    const grid = gridRef.current?.getBoundingClientRect();
    if (!grid) return null;
    return {
      bounds: grid,
      slots: slotRefs.current.map((node) => node?.getBoundingClientRect() ?? { left: 0, top: 0, right: 0, bottom: 0 }),
    };
  };

  const drag = useDragSession<Payload, Destination>({
    onDrop: (payload, target) => record.commits.push({ key: payload.key, slot: target.slot }),
    onCancel: (payload) => record.cancels.push(payload.key),
    onAnnounce: (event) => record.announcements.push(`${event.kind}:${event.origin}`),
    pointer: {
      resolvePointerTarget: ({ point }) => {
        const geometry = measure();
        if (!geometry) return null;
        const slot = resolveGridSlot(point, geometry.slots, { bounds: geometry.bounds });
        return slot === null ? null : { slot };
      },
    },
    keyboard: {
      mode: 'grab',
      orientation: 'horizontal',
      resolveKeyboardTarget: ({ payload, intent, candidate }) => {
        const from = candidate?.slot ?? payload.slot;
        const next = intent === 'next-item' ? from + 1 : intent === 'prev-item' ? from - 1 : from;
        return next < 0 || next >= SLOTS ? { kind: 'blocked' } : { kind: 'target', target: { slot: next } };
      },
    },
  });

  const resize = useResizeSession<string>({
    measureStep: () => ({ inline: SLOT.width + SLOT.gap, block: 1 }),
    onCommit: (subject, intent) => record.resizes.push({ subject, inline: intent.inline, block: intent.block }),
    onCancel: (subject) => record.cancels.push(`resize:${subject}`),
  });

  useEffect(() => {
    if (drag.preview) {
      record.previews.push({
        key: drag.preview.payload.key,
        slot: drag.preview.target?.slot ?? null,
        dx: drag.preview.delta.x,
        dy: drag.preview.delta.y,
      });
    }
  }, [drag.preview]);

  useEffect(() => {
    window.__pointerScene = record;
  }, []);

  return (
    <div
      ref={gridRef}
      data-scene="pointer-session"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLUMNS}, ${SLOT.width}px)`,
        gap: SLOT.gap,
        padding: 0,
        margin: 40,
        width: COLUMNS * SLOT.width + (COLUMNS - 1) * SLOT.gap,
        fontFamily: 'system-ui',
      }}
    >
      {Array.from({ length: SLOTS }, (_, slot) => {
        const payload = { key: `item-${slot}`, slot };
        const { onKeyDown } = drag.getSourceProps(payload);
        return (
          <div
            key={slot}
            ref={(node) => {
              slotRefs.current[slot] = node;
            }}
            data-scene-part="slot"
            data-slot={slot}
            style={{ position: 'relative', height: SLOT.height, background: '#e4e4e4' }}
          >
            <button
              type="button"
              data-scene-part="move"
              data-slot={slot}
              ref={drag.registerItem(payload.key)}
              style={{ width: 60, height: 40, touchAction: 'none' }}
              onKeyDown={onKeyDown}
              {...drag.getPointerSourceProps(payload)}
            >
              {payload.key}
            </button>
            <span
              data-scene-part="resize"
              data-slot={slot}
              style={{ position: 'absolute', insetBlock: 0, insetInlineEnd: 0, width: 10, background: '#999', touchAction: 'none' }}
              {...resize.getHandleProps(payload.key, 'inline-end')}
            />
          </div>
        );
      })}
    </div>
  );
}
