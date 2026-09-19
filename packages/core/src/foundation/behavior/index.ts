/**
 * @fileoverview Headless behavior core.
 *
 * A component's behavior lives here once and its skins read the result off the
 * DOM through `data-part` and `data-state`. Nothing in this directory renders,
 * imports an engine, or knows what a tenant is.
 */

export { serializeState, partAttributes } from './kernel/anatomy';
export type { PartName, InteractionState, PartAttributes } from './kernel/anatomy';

export { useInteractionState } from './runtime/interaction-state';
export type {
  UseInteractionStateOptions,
  UseInteractionStateResult,
} from './runtime/interaction-state';

export { isComposingKey, resolveDelegatedSubmitIntent, resolveSubmitIntent } from './runtime/submit-intent';
export type {
  DelegatedSubmitKeyEvent,
  SubmitIntent,
  SubmitIntentOptions,
  SubmitKeyEvent,
} from './runtime/submit-intent';

export { useFieldAction } from './composition/field-action';
export type { FieldAction, FieldActionHandlers } from './composition/field-action';
