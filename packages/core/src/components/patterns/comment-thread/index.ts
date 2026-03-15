'use client';

/**
 * CommentThread - Pattern Component
 *
 * Engine-aware nested comment thread with replies, editing, and reactions.
 */

import { createEngineComponent } from '../../../engines/factory';
import type { CommentThreadProps } from './CommentThread.types';

export type { CommentThreadProps, Comment, CommentReaction } from './CommentThread.types';

export const PatternCommentThread = createEngineComponent<CommentThreadProps>(
  'PatternCommentThread',
  {
    classic: () => import('./engines/classic'),
    modern: () => import('./engines/modern'),
    rustic: () => import('./engines/rustic'),
  }
);
