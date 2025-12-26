/**
 * ErrorHandler - Centralized error handling for the design system
 */
import {
  DSError,
  DSErrorInput,
  ErrorCategory,
  ErrorSubscriber,
} from './types';

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
    // Initialize category subscriber sets
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

    // Add to log
    this.errorLog.push(error);

    // Trim log if too large
    if (this.errorLog.length > MAX_ERROR_LOG_SIZE) {
      this.errorLog = this.errorLog.slice(-MAX_ERROR_LOG_SIZE);
    }

    // Notify subscribers
    this.notifySubscribers(error);

    // Log to console in development
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
    // Notify category-specific subscribers
    const categorySubscriberIds = this.categorySubscribers.get(error.category);
    categorySubscriberIds?.forEach((id) => {
      const callback = this.subscribers.get(id);
      callback?.(error);
    });

    // Notify "all" subscribers
    const allSubscriberIds = this.categorySubscribers.get('all');
    allSubscriberIds?.forEach((id) => {
      // Skip if already notified via category
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
