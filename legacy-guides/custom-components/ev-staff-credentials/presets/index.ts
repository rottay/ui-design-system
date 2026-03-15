/**
 * EvStaffCredentials - All Presets
 */

export { ListEvStaffCredentials } from './list';
export { ScannerEvStaffCredentials } from './scanner';

import type { EvStaffCredentialsPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvStaffCredentialsProps } from '../core';
import { ListEvStaffCredentials } from './list';
import { ScannerEvStaffCredentials } from './scanner';

export const EV_STAFF_CREDENTIALS_PRESETS: Record<EvStaffCredentialsPreset, ComponentType<EvStaffCredentialsProps>> = {
  list: ListEvStaffCredentials,
  scanner: ScannerEvStaffCredentials,
};
