/**
 * Engine Routing System
 *
 * Provides utilities for creating multi-engine components that automatically
 * switch implementations based on the current engine context.
 */

export { createEngineComponent, lazyEngine, type EngineImplementations } from './createEngineComponent';
export { withEngineRouting } from './withEngineRouting';
export { EngineSwitch } from './EngineSwitch';
