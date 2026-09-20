'use client';

/**
 * @fileoverview The table's `resize-handle` part.
 *
 * The handle owns a real pointer gesture (mousedown starts the column drag),
 * so the hover the skin paints on it is a pointer state the kernel can decide.
 * It is not focusable and the skin paints no focus or press response for it;
 * a live drag stays the family's own `data-resizing` vocabulary.
 */

import React from 'react';

import { partAttributes } from '@/foundation/behavior';

import { usePartInteraction } from '../../kernel';

export type TableResizeHandleProps = React.HTMLAttributes<HTMLSpanElement>;

export const TableResizeHandle = (rest: TableResizeHandleProps) => {
  const { state, props } = usePartInteraction(rest, { stamped: true });

  return <span {...partAttributes('resize-handle', state)} {...props} />;
};

TableResizeHandle.displayName = 'Table.Modern.ResizeHandle';
