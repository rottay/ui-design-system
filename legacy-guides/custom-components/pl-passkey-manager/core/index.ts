/**
 * PlPasskeyManager - Core Interface
 * Register and manage WebAuthn passkeys for passwordless authentication
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

// ─── Preset Variants ─────────────────────────────────────────────────────────

export type PlPasskeyManagerPreset = 'list' | 'setup';

// ─── Domain Types ────────────────────────────────────────────────────────────

/** Current lifecycle status of a passkey credential */
export type PasskeyStatus = 'active' | 'revoked' | 'expired';

/** WebAuthn transport mechanisms supported by authenticators */
export type PasskeyTransport = 'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid';

/** FIDO2 authenticator attachment modality */
export type AuthenticatorType = 'platform' | 'cross-platform';

/** Steps in the passkey registration wizard (setup preset) */
export type SetupStep = 'choose-type' | 'name-device' | 'authenticate' | 'confirm';

// ─── Passkey Entity ──────────────────────────────────────────────────────────

export interface Passkey {
  /** Unique identifier for the passkey record */
  id: string;

  /** User-assigned friendly name for this passkey */
  name: string;

  /** Current status of the passkey */
  status: PasskeyStatus;

  /** WebAuthn credential ID (typically masked/truncated for display) */
  credentialId: string;

  /** Whether this is a platform or cross-platform authenticator */
  authenticatorType: AuthenticatorType;

  /** Transport mechanisms supported by this credential */
  transport: PasskeyTransport[];

  /** Name of the device where the passkey is stored */
  deviceName: string;

  /** Operating system of the device */
  os?: string;

  /** Browser used during registration */
  browser?: string;

  /** Timestamp of last authentication using this passkey */
  lastUsed?: Date;

  /** Timestamp of when this passkey was registered */
  createdAt: Date;

  /** Number of times this credential has been used to authenticate */
  signCount: number;

  /** Whether the authenticator supports credential backup */
  isBackupEligible: boolean;

  /** Whether the credential is currently backed up (synced) */
  isBackedUp: boolean;
}

// ─── Component Props ─────────────────────────────────────────────────────────

export interface PlPasskeyManagerProps extends EngineAwareProps {
  /** Preset variant to render */
  preset?: PlPasskeyManagerPreset;

  /** Array of registered passkeys to display */
  passkeys: Passkey[];

  /** Callback when a passkey row/card is clicked */
  onPasskeyClick?: (passkeyId: string) => void;

  /** Callback to initiate passkey registration */
  onRegister?: () => void;

  /** Callback to revoke a passkey */
  onRevoke?: (passkeyId: string) => void;

  /** Callback to rename a passkey */
  onRename?: (passkeyId: string, newName: string) => void;

  /** Callback to permanently delete a passkey */
  onDelete?: (passkeyId: string) => void;

  // ─── Setup Preset Props ──────────────────────────────────────────────

  /** Current step in the registration wizard (setup preset) */
  currentStep?: SetupStep;

  /** Callback to advance to the next wizard step */
  onNextStep?: () => void;

  /** Callback to go back to the previous wizard step */
  onPrevStep?: () => void;

  /** Selected authenticator type during setup */
  selectedAuthenticatorType?: AuthenticatorType;

  /** Callback when authenticator type selection changes */
  onAuthenticatorTypeChange?: (type: AuthenticatorType) => void;

  /** Passkey name being entered during setup */
  passkeyName?: string;

  /** Callback when passkey name input changes */
  onNameChange?: (name: string) => void;

  /** Whether registration is currently in progress */
  isRegistering?: boolean;

  /** Error message from a failed registration attempt */
  registrationError?: string;

  /** Whether registration completed successfully */
  registrationSuccess?: boolean;

  /** Whether the current browser supports WebAuthn */
  browserSupportsWebAuthn?: boolean;

  // ─── Common Props ────────────────────────────────────────────────────

  /** Loading state */
  loading?: boolean;

  /** Text shown when passkeys array is empty */
  emptyText?: string;

  /** Additional CSS class name(s) */
  className?: string;

  /** Inline CSS styles */
  style?: CSSProperties;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const PL_PASSKEY_MANAGER_DEFAULTS: Partial<PlPasskeyManagerProps> = {
  preset: 'list',
  emptyText: 'No passkeys registered',
  browserSupportsWebAuthn: true,
};
