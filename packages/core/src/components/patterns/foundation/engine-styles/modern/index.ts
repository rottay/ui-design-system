import type { CSSProperties } from 'react';

/** Card surface (replaces DaisyUI card) */
export const panelCardStyle: CSSProperties = {
  background: 'var(--ds-surface-card)',
  borderRadius: 'var(--ds-radius-lg)',
  border: '1px solid var(--ds-color-border-subtle)',
};

/** Small pill badge */
export const pillBadgeSmStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  padding: '1px 6px',
  fontSize: 11,
  fontWeight: 500,
  lineHeight: '16px',
};

/** Inline action group (replaces DaisyUI join) */
export const inlineActionGroupStyle: CSSProperties = {
  display: 'inline-flex',
  borderRadius: 'var(--ds-radius-md)',
  overflow: 'hidden',
  border: '1px solid var(--ds-color-border)',
};

/** CSS border-based spinner (replaces DaisyUI loading) */
export function spinnerStyle(size: number = 20): CSSProperties {
  return {
    display: 'inline-block',
    width: size,
    height: size,
    border: `${Math.max(2, size / 10)}px solid var(--ds-color-border)`,
    borderTopColor: 'var(--ds-color-primary)',
    borderRadius: '50%',
    animation: 'ds-foundation-spin var(--ds-motion-glacial) linear infinite',
    flexShrink: 0,
  };
}

/** Card body padding */
export const cardBodyStyle: CSSProperties = {
  padding: 20,
};

/** Menu section title (replaces DaisyUI menu-title) */
export const menuSectionTitleStyle: CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  fontWeight: 500,
  color: 'var(--ds-color-text-muted)',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
};
