/**
 * EvTicketScanner - All Presets
 */

export { StandardEvTicketScanner } from './standard';
export { KioskEvTicketScanner } from './kiosk';

import type { EvTicketScannerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTicketScannerProps } from '../core';
import { StandardEvTicketScanner } from './standard';
import { KioskEvTicketScanner } from './kiosk';

export const EV_TICKET_SCANNER_PRESETS: Record<EvTicketScannerPreset, ComponentType<EvTicketScannerProps>> = {
  standard: StandardEvTicketScanner,
  kiosk: KioskEvTicketScanner,
};
