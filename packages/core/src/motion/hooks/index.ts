'use client';

/**
 * @fileoverview Motion hooks exports - Rottay Design System
 * @description Public barrel for motion-related hooks.
 */

export { useReducedMotion } from './use-reduced-motion';
export { useInView } from './use-in-view';
export type { UseInViewOptions, UseInViewResult } from './use-in-view';
export { useMousePosition } from './use-mouse-position';
export type { MousePosition } from './use-mouse-position';
export { useScrollProgress } from './use-scroll-progress';
export { useSmoothCounter } from './use-smooth-counter';
// `useMotionPersonality` is the bridge between token personality and motion primitives.
export { useMotionPersonality } from './use-motion-personality';
export { useViewTransition, startDsViewTransition, recordTransitionName } from './use-view-transition';
export type {
  ViewTransitionUpdate,
  StartViewTransitionOptions,
  DsViewTransitionHandle,
} from './use-view-transition';
