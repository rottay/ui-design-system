/**
 * CommentThread - Main Export
 * Automatically selects preset based on props
 */

import type { CommentThreadProps } from './core';
import { COMMENT_THREAD_DEFAULTS } from './core';
import { COMMENT_THREAD_PRESETS } from './presets';

export { type CommentThreadProps, type CommentThreadPreset, type Comment, type CommentAuthor, type AuthorRole, type CommentReaction, type CategoryItem, type SidebarMember, COMMENT_THREAD_DEFAULTS } from './core';
export * from './presets';

/**
 * CommentThread component
 * Renders the appropriate preset based on the preset prop
 */
export function CommentThread(props: CommentThreadProps): React.ReactElement {
  const preset = props.preset ?? COMMENT_THREAD_DEFAULTS.preset ?? 'thread';
  const PresetComponent = COMMENT_THREAD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

CommentThread.displayName = 'CommentThread';

export { ThreadCommentThread, InlineCommentThread } from './presets';
