/**
 * BhDiscussionThread - All Presets
 */

import type { BhDiscussionThreadPreset } from '../core';
import { FullBhDiscussionThread } from './full';

export { FullBhDiscussionThread } from './full';

export const BH_DISCUSSION_THREAD_PRESETS: Record<BhDiscussionThreadPreset, React.ComponentType<any>> = {
  full: FullBhDiscussionThread,
};
