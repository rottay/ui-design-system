/**
 * BhDiscussionThread - All Presets
 */

import type { BhDiscussionThreadPreset, BhDiscussionThreadProps } from '../core';
import type { ComponentType } from 'react';
import { FullBhDiscussionThread } from './full';

export { FullBhDiscussionThread } from './full';

export const BH_DISCUSSION_THREAD_PRESETS: Record<BhDiscussionThreadPreset, ComponentType<BhDiscussionThreadProps>> = {
  full: FullBhDiscussionThread,
};
