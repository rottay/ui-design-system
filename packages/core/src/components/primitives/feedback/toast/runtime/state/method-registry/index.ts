/**
 * Process-local registry used by the standalone toast facade.
 *
 * The provider owns registration while the consumer hook only reads it. Keeping
 * this state in a neutral owner prevents provider and hook modules from importing
 * each other in both directions.
 */

import type { ToastMethods } from '../../../contracts';

let toastMethods: ToastMethods | null = null;

/** Register the active provider's imperative methods. @internal */
export function setToastMethods(methods: ToastMethods): void {
  toastMethods = methods;
}

/** Clear the active provider registration. @internal */
export function clearToastMethods(): void {
  toastMethods = null;
}

/** Read the active provider registration. @internal */
export function getToastMethods(): ToastMethods | null {
  return toastMethods;
}
