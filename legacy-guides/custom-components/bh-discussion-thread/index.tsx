/**
 * BhDiscussionThread - Main Export
 * Discussion/comments thread component for BitHire ATS platform
 */

import type { BhDiscussionThreadProps } from './core';
import { BH_DISCUSSION_THREAD_DEFAULTS } from './core';
import { BH_DISCUSSION_THREAD_PRESETS } from './presets';

export {
  type BhDiscussionThreadProps,
  type BhDiscussionThreadPreset,
  type ThreadStatus,
  type DiscussionEntityType,
  type DiscussionAuthor,
  type CommentReaction,
  type CommentAttachment,
  type DiscussionComment,
  type DiscussionThread,
  BH_DISCUSSION_THREAD_DEFAULTS,
} from './core';
export * from './presets';

/**
 * BhDiscussionThread component
 * Renders the appropriate preset based on the preset prop
 */
export function BhDiscussionThread(props: BhDiscussionThreadProps): React.ReactElement {
  const preset = props.preset ?? BH_DISCUSSION_THREAD_DEFAULTS.preset ?? 'full';
  const PresetComponent = BH_DISCUSSION_THREAD_PRESETS[preset];

  return <PresetComponent {...props} />;
}

BhDiscussionThread.displayName = 'BhDiscussionThread';

export { FullBhDiscussionThread } from './presets';
