import React, { forwardRef } from 'react';

import type { IconMirroring, IconRole, IconState, IconTone } from '../../foundation/contracts';
import { getIconCorpusEntry, isIconName } from '../../foundation/contracts/registry';
import { resolveIconTone, resolveIconWeight } from '../../foundation/contracts/registry/policy';
import type { IconProps } from '../../foundation/contracts/registry/semantic';
import { PhosphorSsrIconAdapter } from '../../runtime/adapters/phosphor-ssr';

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

function normalizeMirroring(value: unknown, autoMirror: boolean): IconMirroring {
  if (value === true || value === false) return value;
  if (value === 'auto') return autoMirror ? 'auto' : false;
  return autoMirror ? 'auto' : false;
}

/** Supplier-independent semantic icon renderer. */
export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(props, ref) {
  const {
    name,
    role,
    state,
    size = 'md',
    tone,
    label,
    decorative,
    mirrored,
    className,
    style,
    id,
    'aria-describedby': ariaDescribedBy,
    'data-testid': testId,
  } = props;

  if (!isIconName(name)) {
    warnOnce(`unknown:${String(name)}`, `Unknown semantic icon "${String(name)}"; rendered null.`);
    return null;
  }

  const normalizedLabel = typeof label === 'string' ? label.trim() : '';
  const isLabeled = normalizedLabel.length > 0;
  const isDecorative = decorative === true;
  if (isLabeled === isDecorative) {
    warnOnce(
      `a11y:${name}:${String(label)}:${String(decorative)}`,
      `Icon "${name}" must have either a non-empty label or decorative={true}; rendered null.`,
    );
    return null;
  }

  const corpusEntry = getIconCorpusEntry(name);
  const resolvedRole = VALID_ROLES.has(role as IconRole) ? role as IconRole : corpusEntry.role;
  const resolvedState = VALID_STATES.has(state as IconState) ? state as IconState : 'idle';
  const requestedTone = VALID_TONES.has(tone as IconTone) ? tone as IconTone : undefined;
  const resolvedTone = resolveIconTone(name, resolvedState, requestedTone);
  const resolvedMirroring = normalizeMirroring(mirrored, corpusEntry.autoMirror);
  const weight = resolveIconWeight(resolvedRole, resolvedState);

  return (
    <PhosphorSsrIconAdapter
      ref={ref}
      name={name}
      role={resolvedRole}
      state={resolvedState}
      size={size}
      tone={resolvedTone}
      weight={weight}
      mirroring={resolvedMirroring}
      label={isLabeled ? normalizedLabel : undefined}
      className={className}
      style={style}
      id={id}
      ariaDescribedBy={ariaDescribedBy}
      testId={testId}
    />
  );
});

Icon.displayName = 'Icon';
