/**
 * EvTicketScanner - Core Interface
 * QR/NFC ticket scanner interface
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTicketScannerPreset = 'standard' | 'kiosk';

export interface ScanResult {
  ticketId: string;
  attendeeName: string;
  ticketType: string;
  status: "valid" | "invalid" | "used" | "expired";
  zone?: string;
  scannedAt: Date;
}

export interface ScanStats {
  totalScans: number;
  validScans: number;
  invalidScans: number;
  duplicateScans: number;
}

export interface EvTicketScannerProps extends EngineAwareProps {
  preset?: EvTicketScannerPreset;
  lastScan?: ScanResult;
  recentScans?: ScanResult[];
  stats?: ScanStats;
  onScan?: (code: string) => void;
  onManualEntry?: (code: string) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TICKET_SCANNER_DEFAULTS: Partial<EvTicketScannerProps> = {
  preset: 'standard',

};
