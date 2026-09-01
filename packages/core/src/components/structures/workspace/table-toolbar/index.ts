'use client';

/**
 * @fileoverview TableToolbar public entry point.
 *
 * Engine-agnostic: the family composes DS primitives (Box/Flex/Input/Button),
 * which resolve through the engine system themselves, so there is one
 * implementation and no per-engine fork.
 *
 * @module Structures/Workspace/TableToolbar
 * @category Structure
 * @package @rottay/design-system
 */

export { TableToolbar } from './runtime/rendering';
export type { TableToolbarPrimaryAction, TableToolbarProps } from './contracts';
