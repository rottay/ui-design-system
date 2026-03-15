/**
 * Runtime logging helpers
 *
 * Development warnings are useful while integrating the DS, but production
 * builds should not spam the host app console. These helpers keep that policy
 * in one place and also let repeated warnings collapse into one message.
 */

const warnedMessages = new Set<string>();

function shouldLog(): boolean {
  return process.env.NODE_ENV !== 'production';
}

export function warnInDev(message: string, ...args: unknown[]): void {
  if (!shouldLog()) {
    return;
  }

  console.warn(message, ...args);
}

export function warnOnceInDev(key: string, message: string, ...args: unknown[]): void {
  if (!shouldLog() || warnedMessages.has(key)) {
    return;
  }

  warnedMessages.add(key);
  console.warn(message, ...args);
}

export function errorInDev(message: string, ...args: unknown[]): void {
  if (!shouldLog()) {
    return;
  }

  console.error(message, ...args);
}
