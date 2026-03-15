/**
 * StaffDirectory - All Presets
 */

export { CardsStaffDirectory } from './cards';
export { TableStaffDirectory } from './table';

import type { StaffDirectoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffDirectoryProps } from '../core';
import { CardsStaffDirectory } from './cards';
import { TableStaffDirectory } from './table';

export const STAFF_DIRECTORY_PRESETS: Record<StaffDirectoryPreset, ComponentType<StaffDirectoryProps>> = {
  cards: CardsStaffDirectory,
  table: TableStaffDirectory,
};
