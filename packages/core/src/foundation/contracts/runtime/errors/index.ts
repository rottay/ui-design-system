/**
 * @fileoverview Error type definitions - Rottay Design System
 * @description Standardized error categories, severity levels, and structured
 * error interfaces for consistent error handling across the design system.
 *
 * @module Foundation/Contracts/Runtime/Errors
 * @category Contracts
 * @package @rottay/design-system
 */

/**
 * Categories of errors that can occur in the design system.
 * Used for filtering and grouping errors.
 */
export enum ErrorCategory {
  /** Errors related to loading assets like images, icons, fonts */
  ASSET_LOAD = 'ASSET_LOAD',
  /** Errors related to theme loading, parsing, or application */
  THEME = 'THEME',
  /** Errors related to engine resolution or initialization */
  ENGINE = 'ENGINE',
  /** Errors related to prop validation or invalid component usage */
  VALIDATION = 'VALIDATION',
  /** Errors related to network requests (API, remote config, etc.) */
  NETWORK = 'NETWORK',
  /** Errors related to tenant resolution or configuration */
  TENANT = 'TENANT',
  /** Errors related to internationalization */
  I18N = 'I18N',
  /** Uncategorized or unexpected errors */
  UNKNOWN = 'UNKNOWN',
}

/**
 * Severity levels for errors.
 * Used to determine how errors should be handled and displayed.
 */
export enum ErrorSeverity {
  /** Informational message, not an actual error */
  INFO = 'INFO',
  /** Warning that should be noted but doesn't break functionality */
  WARNING = 'WARNING',
  /** Error that affects functionality but has a fallback */
  ERROR = 'ERROR',
  /** Critical error that may break the application */
  CRITICAL = 'CRITICAL',
}

/**
 * Standard error interface for the design system.
 * All DS-reported runtime errors should conform to this structure.
 */
export interface DSError {
  /** Unique error code identifier (e.g., 'AVATAR_IMAGE_LOAD_FAILED') */
  code: string;
  /** Human-readable error message for end users */
  message: string;
  /** Technical details for developers (stack trace, internal state, etc.) */
  technicalMessage?: string;
  /** Category of the error for filtering and grouping */
  category: ErrorCategory;
  /** Severity level of the error */
  severity: ErrorSeverity;
  /** Component where the error occurred */
  component?: string;
  /** Additional metadata about the error */
  metadata?: Record<string, unknown>;
  /** Timestamp when the error occurred */
  timestamp: Date;
  /** Original error object if this wraps another error */
  originalError?: Error;
}

/**
 * Input type for creating a new error (without timestamp).
 * Timestamp is automatically added by the ErrorHandler.
 */
export type DSErrorInput = Omit<DSError, 'timestamp'>;

/**
 * Subscription callback type for error listeners.
 */
export type ErrorSubscriber = (error: DSError) => void;
