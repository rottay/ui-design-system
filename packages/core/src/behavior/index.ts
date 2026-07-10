/**
 * @fileoverview Headless behavior core.
 *
 * A component's behavior lives here once and its skins read the result off the
 * DOM through `data-part` and `data-state`. Nothing in this directory renders,
 * imports an engine, or knows what a tenant is.
 */

export { serializeState, partAttributes } from './anatomy';
export type { PartName, InteractionState, PartAttributes } from './anatomy';

export { useInteractionState } from './interaction-state';
export type { UseInteractionStateOptions, UseInteractionStateResult } from './interaction-state';
