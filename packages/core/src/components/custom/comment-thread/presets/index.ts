/**
 * CommentThread - All Presets
 */

import type { CommentThreadPreset } from '../core';
import { ThreadCommentThread } from './thread';
import { InlineCommentThread } from './inline';

export { ThreadCommentThread } from './thread';
export { InlineCommentThread } from './inline';

export const COMMENT_THREAD_PRESETS: Record<CommentThreadPreset, React.ComponentType<any>> = {
  thread: ThreadCommentThread,
  inline: InlineCommentThread,
};
