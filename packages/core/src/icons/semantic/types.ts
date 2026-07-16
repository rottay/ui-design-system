import type { CSSProperties } from 'react';

import type { IconSizeToken } from '../tokens';
import type { IconName } from './registry';

export type IconRole =
  | 'control'
  | 'navigation'
  | 'feature'
  | 'status'
  | 'illustration';

export type IconState = 'idle' | 'active' | 'busy' | 'success' | 'error';

export type IconTone =
  | 'default'
  | 'muted'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

export type IconMirroring = boolean | 'auto';
export type SemanticIconSize = IconSizeToken | number;

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
  className?: string;
  style?: CSSProperties;
  id?: string;
  'aria-describedby'?: string;
  'data-testid'?: string;
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

export interface IconProvenance {
  readonly corpusVersion: number;
  readonly supplier: string;
  readonly packageName: string;
  readonly packageVersion: string;
  readonly license: string;
  readonly rendering: 'local-ssr';
}
