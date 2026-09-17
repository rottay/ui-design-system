/**
 * @fileoverview The drag-session Chromium scene.
 *
 * A unit suite fires synthetic events: `fireEvent.drop()` dispatches a drop
 * whether or not anything cancelled the `dragover`, so the PREVENT-DEFAULT LAW
 * can only be asserted there through its `defaultPrevented` proxy. This scene
 * exists for the four claims that need the browser's own drag-and-drop
 * processing model: that an uncancelled target never receives a drop at all,
 * that the negotiated operation refuses a copy-only source once the kernel
 * writes `move`, that the drag data store really is protected during
 * `dragover`, and that a drop bubbling through nested kernel targets commits
 * exactly once.
 *
 * The scene records into a module-level log and publishes it on `window`, so
 * the runner asserts inside the page -- the only place a drag-and-drop
 * implementation exists.
 */

import React, { useEffect, useState } from 'react';

import { useDragSession } from '../../../index';

type CardPayload = { key: string };
type BoardTarget = { columnId: string; position: number };

interface SceneRecord {
  readonly commits: Array<{ key: string; columnId: string; position: number }>;
  readonly announcements: string[];
  readonly events: string[];
  readonly transfer: Array<{ phase: string; data: string; types: string[]; dropEffect: string }>;
  readonly pressCancels: number;
}

const record: SceneRecord & { pressCancels: number } = {
  commits: [],
  announcements: [],
  events: [],
  transfer: [],
  pressCancels: 0,
};

declare global {
  interface Window {
    __dragScene?: SceneRecord;
  }
}

export function DragSessionScene(): React.JSX.Element {
  const [dropEvents, setDropEvents] = useState(0);

  const board = useDragSession<CardPayload, BoardTarget>({
    onDrop: (payload, target) => {
      record.commits.push({ key: payload.key, ...target });
    },
    onAnnounce: (event) => {
      record.announcements.push(`${event.kind}:${event.origin}`);
    },
  });

  const pressSource = useDragSession<CardPayload, BoardTarget>({
    onDrop: () => {},
    pressCancel: () => {
      record.pressCancels += 1;
    },
  });

  useEffect(() => {
    window.__dragScene = record;
  }, []);

  /** Reads the drag data store exactly where each claim needs it read. */
  const observe = (phase: string, event: React.DragEvent) => {
    record.events.push(phase);
    record.transfer.push({
      phase,
      data: event.dataTransfer.getData('text/plain'),
      types: [...event.dataTransfer.types],
      dropEffect: event.dataTransfer.dropEffect,
    });
  };

  const columnTarget = board.getTargetProps({ columnId: 'done', position: 2 });
  const cardTarget = board.getTargetProps({ columnId: 'done', position: 0 }, { stopPropagation: true });
  const cardSource = board.getSourceProps({ key: 'card-1' });

  return (
    <div data-scene="drag-session" style={{ padding: 24, fontFamily: 'system-ui' }}>
      <div
        data-scene-part="column-body"
        style={{ width: 320, padding: 16, background: '#f2f2f2' }}
        onDragOver={(event) => {
          observe('column-dragover', event);
          columnTarget.onDragOver?.(event);
        }}
        onDrop={(event) => {
          observe('column-drop', event);
          columnTarget.onDrop?.(event);
        }}
      >
        <div
          data-scene-part="card"
          data-dragging={board.session?.payload.key === 'card-1'}
          style={{ width: 240, height: 72, background: '#dcdcdc' }}
          {...cardSource}
          onDragStart={(event) => {
            observe('card-dragstart', event);
            cardSource.onDragStart?.(event);
          }}
          onDragOver={(event) => {
            observe('card-dragover', event);
            cardTarget.onDragOver?.(event);
          }}
          onDrop={(event) => {
            observe('card-drop', event);
            setDropEvents((count) => count + 1);
            cardTarget.onDrop?.(event);
          }}
        >
          card-1
        </div>
      </div>

      {/* Not a kernel source: a copy-only drag, which is the arm the DROPEFFECT
          LAW actually changes. */}
      <div
        data-scene-part="copy-source"
        draggable
        style={{ width: 240, height: 48, background: '#cde' }}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = 'copy';
          event.dataTransfer.setData('text/plain', 'foreign');
          record.events.push('copy-dragstart');
        }}
      >
        copy-only source
      </div>

      {/* The source the `pressCancel` option exists for: it owns no
          component-local cleanup boundary of its own. */}
      <div
        data-scene-part="press-source"
        style={{ width: 240, height: 48, background: '#dec' }}
        {...pressSource.getSourceProps({ key: 'press' })}
      >
        press-cancel source
      </div>

      <output data-scene-part="drop-events">{dropEvents}</output>
    </div>
  );
}
