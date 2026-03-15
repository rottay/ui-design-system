/**
 * BhWarRoom - All Presets
 */

export { ListBhWarRoom } from './list';
export { CollaborativeBhWarRoom } from './collaborative';

import type { BhWarRoomPreset } from '../core';
import type { ComponentType } from 'react';
import type { BhWarRoomProps } from '../core';
import { ListBhWarRoom } from './list';
import { CollaborativeBhWarRoom } from './collaborative';

export const BH_WAR_ROOM_PRESETS: Record<BhWarRoomPreset, ComponentType<BhWarRoomProps>> = {
  list: ListBhWarRoom,
  collaborative: CollaborativeBhWarRoom,
};
