import type { CSSProperties } from 'react';

import type { IconSizeToken } from '../../..';
import type {
  IconMirroring,
  IconRole,
  IconState,
  IconTone,
  SemanticIconSize,
} from '../..';
import type { IconName } from '..';

interface IconVisualProps {
  /** Stable product meaning; never a supplier component or glyph name. */
  name: IconName;
  /** Optional presentation role. It may alter finish/weight, never meaning. */
  role?: IconRole;
  state?: IconState;
  size?: SemanticIconSize;
  tone?: IconTone;
  /** `auto` mirrors through CSS logical direction without reading document. */
  mirrored?: IconMirroring;
  /** Optional local color override; defaults to the inherited currentColor. */
  color?: string;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
  /** Optional anatomy marker supplied by the component that owns the icon. */
  'data-part'?: string;
}

type LabeledIcon = {
  /** Accessible name. Produces both SVG title and aria-label. */
  label: string;
  decorative?: false;
};

type DecorativeIcon = {
  label?: never;
  /** Decorative intent must be explicit. */
  decorative: true;
};

/**
 * Accessibility is a discriminated contract: every icon is explicitly named
 * or explicitly decorative. Untyped invalid input fails closed at runtime.
 */
export type IconProps = IconVisualProps & (LabeledIcon | DecorativeIcon);

export type {
  IconMirroring,
  IconRole,
  IconState,
  IconTone,
  SemanticIconSize,
};
