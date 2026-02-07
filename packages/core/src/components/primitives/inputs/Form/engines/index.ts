/**
 * @fileoverview Form Engine Implementations - Rottay Design System
 * @description Engine-specific form implementations for multi-library support.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * This module provides the barrel export for all Form engine implementations.
 * Each engine provides the Form component with compound components and the
 * useForm hook for programmatic control.
 *
 * **Available Engines:**
 * - **Classic**: Ant Design implementation with async validation, rich feedback
 * - **Modern**: DaisyUI/Tailwind CSS implementation with custom validation
 * - **Rustic**: Pure HTML/CSS implementation with full accessibility
 *
 * **Exports per Engine:**
 * Each engine exports:
 * - `Form` - Main form component with Item, List, ErrorList compounds
 * - `useForm` - Hook for programmatic form control
 *
 * @example Engine Selection
 * ```tsx
 * import { Form, EngineProvider } from '@rottay/design-system';
 *
 * // Per-component engine override
 * <Form engine="modern" layout="vertical">
 *   <Form.Item name="email" label="Email">
 *     <Input />
 *   </Form.Item>
 * </Form>
 *
 * // Global engine via provider
 * <EngineProvider engine="rustic">
 *   <Form layout="vertical">...</Form>
 * </EngineProvider>
 * ```
 *
 * @see {@link ClassicForm} for Ant Design implementation
 * @see {@link ModernForm} for DaisyUI implementation
 * @see {@link RusticForm} for vanilla implementation
 * @module FormEngines
 * @category Inputs
 * @package @rottay/design-system
 */

// ============================================================================
// ENGINE EXPORTS
// ============================================================================

export { Form as ClassicForm, useForm as ClassicUseForm } from './classic';
export { Form as ModernForm, useForm as ModernUseForm } from './modern';
export { Form as RusticForm, useForm as RusticUseForm } from './rustic';
