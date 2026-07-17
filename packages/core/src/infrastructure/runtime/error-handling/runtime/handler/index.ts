/**
 * @fileoverview ErrorHandler - Rottay Design System
 * @description Centralized singleton error bus that standardizes categorization,
 * subscriptions, and dev-mode console logging for all DS runtime errors.
 *
 * @remarks
 * The ErrorHandler is intentionally lightweight. It provides:
 * - **Reporting**: Structured error creation with auto-timestamps
 * - **Subscriptions**: Category-specific and catch-all error listeners
 * - **Bounded log**: In-memory ring buffer (100 entries) for debugging
 * - **Dev logging**: Severity-aware console output in development only
 *
 * Host applications control production logging through subscriptions.
 * The singleton can be reset between tests via `ErrorHandler.resetInstance()`.
 *
 * @see {@link useErrorHandler} - React hook for component-level error handling
 * @see {@link ErrorCategory} - Supported error categories
 * @module System/Errors/ErrorHandler
 * @category System
 * @package @rottay/design-system
 */
import {
  DSError,
  DSErrorInput,
  ErrorCategory,
  ErrorSubscriber,
} from '@/foundation/contracts/runtime/errors';

/**
 * Maximum number of errors to keep in the log
 */
const MAX_ERROR_LOG_SIZE = 100;

/**
 * Singleton class for centralized error handling.
 * Provides methods to report, subscribe to, and manage errors.
 */
class ErrorHandler {
  private static instance: ErrorHandler | null = null;
  private errorLog: DSError[] = [];
  private subscribers: Map<string, ErrorSubscriber> = new Map();
  private categorySubscribers: Map<ErrorCategory | 'all', Set<string>> =
    new Map();

  private constructor() {
    // Pre-create category sets so subscription and notification stay O(1)
    // without defensive branching on every report.
    Object.values(ErrorCategory).forEach((category) => {
      this.categorySubscribers.set(category, new Set());
    });
    this.categorySubscribers.set('all', new Set());
  }

  /**
   * Get the singleton instance of ErrorHandler
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Reset the singleton instance (mainly for testing)
   */
  public static resetInstance(): void {
    ErrorHandler.instance = null;
  }

  /**
   * Report a new error
   */
  public reportError(errorInput: DSErrorInput): DSError {
    const error: DSError = {
      ...errorInput,
      timestamp: new Date(),
    };

    // The in-memory log is a debugging aid, not a permanent store.
    this.errorLog.push(error);

    // Ring buffer behavior: once the log exceeds the cap, trim from the front.
    // This keeps memory bounded in long-lived sessions (Storybook, admin apps)
    // while retaining the most recent errors for debugging.
    if (this.errorLog.length > MAX_ERROR_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-MAX_ERROR_LOG_SIZE);
    }

    // Subscribers are how hooks and debug tooling react to DS-level errors.
    this.notifySubscribers(error);

    // Console logging stays dev-only so host applications control production logging.
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(error);
    }

    return error;
  }

  /**
   * Subscribe to errors
   * @returns Unsubscribe function
   */
  public subscribe(
    id: string,
    callback: ErrorSubscriber,
    category: ErrorCategory | 'all' = 'all'
  ): () => void {
    this.subscribers.set(id, callback);
    this.categorySubscribers.get(category)?.add(id);

    return () => {
      this.subscribers.delete(id);
      this.categorySubscribers.get(category)?.delete(id);
    };
  }

  /**
   * Get the current error log
   */
  public getErrorLog(): readonly DSError[] {
    return Object.freeze([...this.errorLog]);
  }

  /**
   * Get errors by category
   */
  public getErrorsByCategory(category: ErrorCategory): readonly DSError[] {
    return Object.freeze(
      this.errorLog.filter((error) => error.category === category)
    );
  }

  /**
   * Clear the error log
   */
  public clearLog(): void {
    this.errorLog = [];
  }

  /**
   * Get the most recent error
   */
  public getLastError(): DSError | undefined {
    return this.errorLog[this.errorLog.length - 1];
  }

  private notifySubscribers(error: DSError): void {
    // Notify category-specific subscribers first so targeted handlers run before
    // catch-all observers.
    const categorySubscriberIds = this.categorySubscribers.get(error.category);
    categorySubscriberIds?.forEach((id) => {
      const callback = this.subscribers.get(id);
      callback?.(error);
    });

    // "all" subscribers receive every error regardless of category, but the
    // dedup check below prevents double-notification when a subscriber is
    // registered under both a specific category and the "all" bucket.
    const allSubscriberIds = this.categorySubscribers.get('all');
    allSubscriberIds?.forEach((id) => {
      if (!categorySubscriberIds?.has(id)) {
        const callback = this.subscribers.get(id);
        callback?.(error);
      }
    });
  }

  private logToConsole(error: DSError): void {
    const prefix = `[DS Error - ${error.category}]`;
    const message = `${prefix} ${error.message}`;

    switch (error.severity) {
      case 'CRITICAL':
      case 'ERROR':
        console.error(message, error);
        break;
      case 'WARNING':
        console.warn(message, error);
        break;
      case 'INFO':
        console.info(message, error);
        break;
    }
  }
}

export { ErrorHandler };
