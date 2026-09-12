import { forwardRef } from 'react';
import type {
  ComponentType,
  ElementType,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  Ref,
  RefAttributes,
  SVGProps,
} from 'react';

import {
  isGraphicAssetAdapterEnabled,
  reportGraphicAssetTelemetry,
} from '../../../../../infrastructure/runtime/graphics/asset-governance/runtime/control';
import { ICON_SIZE_MAP } from '../../../glyphs/foundation';
import type { IconRole, IconState, IconTone } from '../../../glyphs/foundation/contracts';
import { resolveIconWeight } from '../../foundation/policy';
import { useActiveIconExpressiveProfile } from '../../../../../infrastructure/runtime/foundation/icons/active-profile/foundation/read';
import type { IconProps } from '../../foundation/contracts';

type DistributiveOmit<T, Key extends PropertyKey> = T extends unknown ? Omit<T, Key> : never;

/** Supplier-free props for a generated named semantic icon. */
export type SemanticIconProps = DistributiveOmit<IconProps, 'name'>;

/** Supplier-free component contract shared by generated roles and pack resolvers. */
export type SemanticIconComponent = ForwardRefExoticComponent<
  PropsWithoutRef<SemanticIconProps> & RefAttributes<SVGSVGElement>
>;

export interface SemanticIconDefinition {
  readonly name: string;
  readonly componentName: string;
  readonly defaultRole: IconRole;
  readonly defaultTone?: IconTone;
  readonly autoMirror: boolean;
}

type SemanticIconWeight = 'regular' | 'bold' | 'fill' | 'duotone';

interface SsrGlyphProps extends SVGProps<SVGSVGElement> {
  readonly ref?: Ref<SVGSVGElement>;
  readonly size?: string | number;
  readonly weight?: SemanticIconWeight;
  readonly mirrored?: boolean;
  readonly alt?: string;
  readonly 'data-testid'?: string;
  readonly 'data-part'?: string;
  readonly 'data-asset-class'?: string;
  readonly 'data-icon-name'?: string;
  readonly 'data-icon-role'?: string;
  readonly 'data-icon-state'?: string;
  readonly 'data-icon-tone'?: string;
  readonly 'data-icon-weight'?: string;
  readonly 'data-icon-mirrored'?: string;
}

const VALID_ROLES: ReadonlySet<IconRole> = new Set([
  'control',
  'navigation',
  'feature',
  'status',
  'illustration',
]);
const VALID_STATES: ReadonlySet<IconState> = new Set(['idle', 'active', 'busy', 'success', 'error']);
const VALID_TONES: ReadonlySet<IconTone> = new Set([
  'default',
  'muted',
  'primary',
  'success',
  'warning',
  'error',
  'info',
]);
const warnedInputs = new Set<string>();

function warnOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === 'production' || warnedInputs.has(key)) return;
  warnedInputs.add(key);
  console.warn(`[Rottay Icon] ${message}`);
}

function resolveSize(value: unknown): string | number {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? value : ICON_SIZE_MAP.md;
  }
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(ICON_SIZE_MAP, value)
    ? ICON_SIZE_MAP[value]
    : ICON_SIZE_MAP.md;
}

function resolveTone(
  defaultTone: IconTone | undefined,
  state: IconState,
  requestedTone: unknown,
): IconTone {
  if (VALID_TONES.has(requestedTone as IconTone)) return requestedTone as IconTone;
  if (state === 'success') return 'success';
  if (state === 'error') return 'error';
  return defaultTone ?? 'default';
}

function normalizeMirroring(value: unknown, autoMirror: boolean): boolean | 'auto' {
  if (value === true || value === false) return value;
  if (value === 'auto') return autoMirror ? 'auto' : false;
  return autoMirror ? 'auto' : false;
}

/**
 * Binds one exact local SSR glyph to the supplier-free semantic icon contract.
 * Generated role modules are the only callers; applications receive only the
 * returned SemanticIconComponent.
 */
export function createSemanticIcon(
  glyph: ElementType,
  definition: SemanticIconDefinition,
): SemanticIconComponent {
  const Glyph = glyph as ComponentType<SsrGlyphProps>;
  const {
    name,
    defaultRole,
    defaultTone,
    autoMirror,
  } = definition;

  const Component = forwardRef<SVGSVGElement, SemanticIconProps>(function GeneratedSemanticIcon(
    props,
    ref,
  ) {
    const {
      role,
      state,
      size = 'md',
      tone,
      color,
      label,
      decorative,
      mirrored,
      className,
      style,
      id,
      'aria-describedby': ariaDescribedBy,
      'data-testid': testId,
      'data-part': dataPart,
    } = props;

    const activeIconProfile = useActiveIconExpressiveProfile();

    const normalizedLabel = typeof label === 'string' ? label.trim() : '';
    const isLabeled = normalizedLabel.length > 0;
    const isDecorative = decorative === true;
    if (isLabeled === isDecorative) {
      reportGraphicAssetTelemetry({
        code: 'accessible-name-failure',
        assetClass: 'semantic-icon',
        assetKey: name,
        outcome: 'dropped',
      });
      warnOnce(
        `a11y:${name}:${String(label)}:${String(decorative)}`,
        `Icon "${name}" must have either a non-empty label or decorative={true}; rendered null.`,
      );
      return null;
    }

    if (!isGraphicAssetAdapterEnabled('semantic-icon', name)) return null;

    const resolvedRole = VALID_ROLES.has(role as IconRole) ? role as IconRole : defaultRole;
    const resolvedState = VALID_STATES.has(state as IconState) ? state as IconState : 'idle';
    const resolvedTone = resolveTone(defaultTone, resolvedState, tone);
    const resolvedMirroring = normalizeMirroring(mirrored, autoMirror);
    const weight = resolveIconWeight(
      resolvedRole,
      resolvedState,
      activeIconProfile,
    );
    const mirrorMarker = resolvedMirroring === 'auto'
      ? 'auto'
      : resolvedMirroring
        ? 'true'
        : 'false';

    return (
      <Glyph
        ref={ref}
        id={id}
        size={resolveSize(size)}
        color={color ?? 'currentColor'}
        weight={weight}
        mirrored={resolvedMirroring === true}
        alt={isLabeled ? normalizedLabel : undefined}
        className={`rottay-icon rottay-semantic-icon ${className ?? ''}`.trim()}
        style={style}
        focusable="false"
        role={isLabeled ? 'img' : undefined}
        aria-label={isLabeled ? normalizedLabel : undefined}
        aria-describedby={ariaDescribedBy}
        aria-hidden={isLabeled ? undefined : true}
        data-testid={testId}
        data-part={dataPart}
        data-asset-class="semantic-icon"
        data-icon-name={name}
        data-icon-role={resolvedRole}
        data-icon-state={resolvedState}
        data-icon-tone={resolvedTone}
        data-icon-weight={weight}
        data-icon-mirrored={mirrorMarker}
      />
    );
  });

  if (process.env.NODE_ENV !== 'production') {
    Component.displayName = definition.componentName;
  }
  return Component;
}
