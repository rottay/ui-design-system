import type { CSSProperties, ReactNode } from 'react';

import type { IconName } from '@/graphics/icons/foundation/contracts/registry';
import type { IconMirroring } from '@/graphics/icons/foundation/contracts/registry/semantic';

/**
 * Size axis. Maps to the canonical icon scale and the density-effective
 * spacing scale; the frame never fixes pixels in the TSX.
 */
export type IconFrameSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Geometry axis. `square` is sharp, `rounded` rides the tenant radius scale. */
export type IconFrameShape = 'circle' | 'square' | 'rounded';

/**
 * Material axis. Every variant derives from existing semantic channels:
 * `subtle` (tone wash), `outline` (tone edge) and `glass` (bounded frost
 * riding the governed glass recipe). A solid `filled` variant requires the
 * per-tone on-ink authority (`--ds-color-on-<tone>`, emitted by BOTH theme
 * paths) — a single shared ink cannot pass contrast on all six tones under
 * every tenant, so the variant ships only once that authority exists.
 */
export type IconFrameVariant = 'subtle' | 'outline' | 'glass';

/** Semantic tone. `neutral` follows the secondary text channel. */
export type IconFrameTone = 'neutral' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface IconFrameBaseProps {
  /**
   * Stable product meaning rendered inside the frame. Always a governed
   * semantic icon name — never a supplier component, raw SVG or unicode.
   */
  icon: IconName;
  size?: IconFrameSize;
  shape?: IconFrameShape;
  variant?: IconFrameVariant;
  tone?: IconFrameTone;
  /**
   * Busy presentation: the icon rides the governed `busy` icon state and the
   * root reports `aria-busy`. Never color-only: the busy cue is governed
   * motion.
   */
  loading?: boolean;
  /** Muted presentation plus `aria-disabled`; never color-only. */
  disabled?: boolean;
  /**
   * Optional indicator slot anchored to the frame corner (compose `Badge`
   * WITHOUT its own `position` prop — the frame owns the anchor). The
   * slotted content keeps its own semantics.
   */
  badge?: ReactNode;
  /** Mirror policy forwarded to the inner icon (`auto` follows CSS direction). */
  iconMirroring?: IconMirroring;
  className?: string;
  style?: CSSProperties;
  id?: string;
  'data-testid'?: string;
  'aria-describedby'?: string;
}

interface IconFrameSemantic {
  /**
   * Accessible name for a framed icon that carries meaning. The root becomes
   * the semantic unit (`role="img"`) and the icon inside is decorative.
   */
  label: string;
  decorative?: false;
}

interface IconFrameDecorative {
  label?: never;
  /** Explicit ornament intent: adjacent text carries the meaning. */
  decorative: true;
}

/**
 * Contract for the engine-independent IconFrame primitive.
 *
 * @description IconFrame is the single owner of the framed-icon medallion
 * repeated across headers, cards, rows, metrics and states. It composes
 * exclusively governed semantic icons and paints through its canonical skin
 * (`presentation/components/icon-frame.css`), so tenants can reshape it
 * radically through the existing size/radius/material/border/elevation/
 * density channels without a parallel color system.
 *
 * IconFrame is PRESENTATION ONLY — it never renders a control. Icon-only
 * actions are `Button.Icon`, the action primitive, which inherits touch
 * floors, focus chrome, busy semantics and tenant personality by composing
 * `Button`; a framed medallion that must be clickable composes the two.
 *
 * It does not duplicate `Badge` (status/indicator), `Avatar` (identity) or
 * `Button.Icon` (icon-only action): IconFrame only frames an icon.
 *
 * Accessibility is a discriminated contract, mirroring the Icon law: every
 * frame is explicitly semantic (`label`) or explicitly decorative.
 */
export type IconFrameProps = IconFrameBaseProps & (IconFrameSemantic | IconFrameDecorative);
