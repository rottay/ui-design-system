/**
 * EvStaffDirectory - All Presets
 */

export { CardsEvStaffDirectory } from './cards';
export { TableEvStaffDirectory } from './table';

import type { EvStaffDirectoryPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvStaffDirectoryProps } from '../core';
import { CardsEvStaffDirectory } from './cards';
import { TableEvStaffDirectory } from './table';

export const EV_STAFF_DIRECTORY_PRESETS: Record<EvStaffDirectoryPreset, ComponentType<EvStaffDirectoryProps>> = {
  cards: CardsEvStaffDirectory,
  table: TableEvStaffDirectory,
};
