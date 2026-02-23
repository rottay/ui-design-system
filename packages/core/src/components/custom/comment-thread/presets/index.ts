/**
 * CommentThread - All Presets
 */

import type { CommentThreadPreset, CommentThreadProps } from '../core';
import type { ComponentType } from 'react';
import { ThreadCommentThread } from './thread';
import { InlineCommentThread } from './inline';

export { ThreadCommentThread } from './thread';
export { InlineCommentThread } from './inline';

export const COMMENT_THREAD_PRESETS: Record<CommentThreadPreset, ComponentType<CommentThreadProps>> = {
  thread: ThreadCommentThread,
  inline: InlineCommentThread,
};
