/**
 * @fileoverview Engine System - Rottay Design System
 * @description Central exports for the multi-engine architecture, providing
 * component factories, registries, error boundaries, and pluggable implementations.
 *
 * @remarks
 * The engine system enables components to render using different UI libraries:
 *
 * **Engines:**
 * - **Classic**: Ant Design - Enterprise, structured components
 * - **Modern**: DaisyUI/Tailwind - Contemporary, rounded
 * - **Rustic**: Vanilla HTML/CSS - Minimal, spacious
 * - **Custom**: Pluggable - Custom implementations
 *
 * @see {@link createEngineComponent} - Component factory
 * @see {@link ENGINE_REGISTRY} - Engine metadata
 * @see {@link registerCustomComponent} - Custom components
 * @module System/Engines
 * @category System
 * @package @rottay/design-system
 */
export * from './registry';
export * from './factory';
export * from './binding';
export * from './boundary';
export * from './resolution';
export * from './custom';
export * from './skin-pack';
export * from './example-pack';
export * from './EngineProvider';
export * from './AntdConfigProvider';
