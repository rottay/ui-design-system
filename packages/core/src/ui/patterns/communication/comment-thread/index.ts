'use client';

/**
 * @fileoverview CommentThread pattern -- engine-aware nested comment thread
 * with replies, editing, reactions, and configurable nesting depth. Renders
 * a recursive comment tree with avatar, timestamp, and inline editing.
 */

import { createEngineComponent } from '../../../../infrastructure/runtime/engines/presentation/component-factory';
import type { CommentThreadProps } from './contracts';

export type { CommentThreadProps, Comment, CommentReaction } from './contracts';

export const PatternCommentThread = createEngineComponent<CommentThreadProps>(
  'PatternCommentThread',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
