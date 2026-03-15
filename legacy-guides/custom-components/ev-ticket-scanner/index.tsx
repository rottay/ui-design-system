/**
 * EvTicketScanner - Main Export
 * QR/NFC ticket scanner interface
 * Automatically selects preset based on props
 */

import type { EvTicketScannerProps } from './core';
import { EV_TICKET_SCANNER_DEFAULTS } from './core';
import { EV_TICKET_SCANNER_PRESETS } from './presets';

export {
  type EvTicketScannerProps,
  type EvTicketScannerPreset,
  type ScanResult as EvTicketScannerScanResult,
  type ScanStats as EvTicketScannerScanStats,
  EV_TICKET_SCANNER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvTicketScanner component
 * Renders the appropriate preset based on the preset prop
 */
export function EvTicketScanner(props: EvTicketScannerProps): React.ReactElement {
  const preset = props.preset ?? EV_TICKET_SCANNER_DEFAULTS.preset ?? 'standard';
  const PresetComponent = EV_TICKET_SCANNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvTicketScanner.displayName = 'EvTicketScanner';

export { StandardEvTicketScanner, KioskEvTicketScanner } from './presets';
