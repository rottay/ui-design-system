/**
 * StaffCredentialManager - All Presets
 */

export { GridStaffCredentialManager } from './grid';
export { TableStaffCredentialManager } from './table';

import type { StaffCredentialManagerPreset } from '../core';
import type { ComponentType } from 'react';
import type { StaffCredentialManagerProps } from '../core';
import { GridStaffCredentialManager } from './grid';
import { TableStaffCredentialManager } from './table';

export const STAFF_CREDENTIAL_MANAGER_PRESETS: Record<StaffCredentialManagerPreset, ComponentType<StaffCredentialManagerProps>> = {
  grid: GridStaffCredentialManager,
  table: TableStaffCredentialManager,
};
