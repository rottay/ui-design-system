/**
 * EvSongRequests - All Presets
 */

export { QueueEvSongRequests } from './queue';
export { VotingEvSongRequests } from './voting';

import type { EvSongRequestsPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvSongRequestsProps } from '../core';
import { QueueEvSongRequests } from './queue';
import { VotingEvSongRequests } from './voting';

export const EV_SONG_REQUESTS_PRESETS: Record<EvSongRequestsPreset, ComponentType<EvSongRequestsProps>> = {
  queue: QueueEvSongRequests,
  voting: VotingEvSongRequests,
};
