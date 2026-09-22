/**
 * @fileoverview Layout animation kernel -- public barrel
 * @description The one door (`useLayoutAnimation`), its scope (`LayoutGroup`),
 * the list presence equivalent (`PresenceList`) and the two hooks the door
 * composes, published under their own names for call sites that want one arm.
 */

export { useLayoutAnimation } from './facade';
export { LayoutGroup } from './composition/react/group';
export { PresenceList, PRESENCE_ITEM_ATTRIBUTE } from './composition/react/presence-list';
export type { PresenceListProps } from './composition/react/presence-list';
export { useFlipLayout } from './runtime/reflow';
export type { UseFlipLayoutOptions, UseFlipLayoutResult } from './runtime/reflow';
export { useSizeAnimation, supportsKeywordSizeInterpolation } from './runtime/size';
export type { UseSizeAnimationOptions } from './runtime/size';
export { useSharedElementKey } from './runtime/shared-element';
export { LAYOUT_CHANNEL_DEFAULTS } from './kernel/channels';
export type {
  LayoutAnimationKind,
  LayoutAnimationOptions,
  LayoutChannelPair,
  LayoutGroupProps,
  PresenceResult,
  ReflowResult,
  ResolvedSizeStrategy,
  SharedResult,
  SizeResult,
  SizeStrategy,
  TimedLayoutAnimationKind,
} from './contracts';
