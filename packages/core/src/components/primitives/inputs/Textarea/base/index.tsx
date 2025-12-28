/**
 * @fileoverview Textarea Base Component - Rottay Design System
 * @description Core textarea implementation placeholder with CSS variables.
 * Part of the Rottay Design System's input primitives collection.
 *
 * @remarks
 * The BaseTextarea provides a minimal wrapper for CSS variable integration.
 * Engine implementations provide the full textarea functionality, while
 * this base serves as a foundation for custom styling needs.
 *
 * **CSS Variable Integration:**
 * - Uses `rottay-textarea` class for styling hooks
 * - Forwards className and style props
 * - Can be extended for custom implementations
 *
 * @example Using BaseTextarea
 * ```tsx
 * import { BaseTextarea } from '@rottay/design-system';
 *
 * <BaseTextarea
 *   className="my-custom-textarea"
 *   style={{ minHeight: '200px' }}
 * />
 * ```
 *
 * @see {@link Textarea} for the engine-routed component
 * @module BaseTextarea
 * @category Inputs
 * @package @rottay/design-system
 */

'use client';
import { forwardRef } from 'react';
import type { TextareaProps } from '../types';

// Base textarea wrapper - engine implementations provide full functionality
export const BaseTextarea = forwardRef<HTMLDivElement, TextareaProps>((props, ref) => {
  const { className = '', style = {} } = props;
  return <div ref={ref} className={`rottay-textarea ${className}`} style={style} />;
});
BaseTextarea.displayName = 'BaseTextarea';
