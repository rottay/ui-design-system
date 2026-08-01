'use client';

/**
 * @fileoverview Motion hooks exports - Rottay Design System
 * @description Public barrel for motion-related hooks.
 */

export { useReducedMotion } from './foundation/reduced-motion';
export { useInView } from './in-view';
export type { UseInViewOptions, UseInViewResult } from './in-view';
export { useMousePosition } from './mouse-position';
export type { MousePosition } from './mouse-position';
export { useScrollProgress } from './scroll-progress';
export { useSmoothCounter } from './smooth-counter';
// `useMotionPersonality` is the bridge between token personality and motion primitives.
export { useMotionPersonality } from './motion-personality';
export {
  useViewTransition,
  startDsViewTransition,
  recordTransitionName,
  useDirectionalViewTransition,
  startDirectionalViewTransition,
  directionFromIndexDelta,
  tabPanelTransitionName,
  tabPanelTransitionStyle,
  recordMorphStyle,
  VIEW_TRANSITION_DIRECTION_ATTRIBUTE,
  TAB_PANEL_TRANSITION_CLASS,
  RECORD_MORPH_TRANSITION_CLASS,
  MODAL_PROMOTE_TRANSITION_NAME,
} from './view-transition';
export type {
  ViewTransitionUpdate,
  StartViewTransitionOptions,
  DsViewTransitionHandle,
  ViewTransitionDirection,
  StartDirectionalViewTransitionOptions,
} from './view-transition';
export { usePresence } from './presence';
export type { UsePresenceOptions, UsePresenceResult } from './presence';
export {
  governedExitMs,
  governedFlashMs,
  resolveExitFallbackMs,
} from './presence/duration';
export type {
  ExitFallbackOptions,
  GovernedMotionChannel,
} from './presence/duration';
export { useFlipLayout } from './flip-layout';
export type { UseFlipLayoutOptions, UseFlipLayoutResult } from './flip-layout';
