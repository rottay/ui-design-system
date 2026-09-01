import type { CSSProperties } from 'react';

/** Popup/dropdown panel surface */
export const popupPanelStyle: CSSProperties = {
  background: 'var(--ds-surface-card)',
  border: '1px solid var(--ds-color-border-subtle)',
  borderRadius: 'var(--ds-radius-lg)',
  boxShadow: 'var(--ds-elevation-2)',
  padding: 4,
};

/** Menu list (replaces DaisyUI menu) */
export const menuListStyle: CSSProperties = {
  listStyle: 'none',
  margin: 0,
  padding: 4,
};

/** Menu item base (replaces DaisyUI menu li) */
export const menuItemStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 'var(--ds-radius-md)',
  fontSize: 14,
  cursor: 'pointer',
  transition: 'background var(--ds-motion-fast) ease-out',
  color: 'var(--ds-color-text-primary)',
  background: 'transparent',
  border: 'none',
  width: '100%',
  textAlign: 'left' as const,
};

/** Card surface (replaces DaisyUI card) */
export const panelCardStyle: CSSProperties = {
  background: 'var(--ds-surface-card)',
  borderRadius: 'var(--ds-radius-lg)',
  border: '1px solid var(--ds-color-border-subtle)',
};

/** Pill badge (replaces DaisyUI badge) */
export const pillBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  padding: '2px 8px',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: '16px',
};

/** Small pill badge */
export const pillBadgeSmStyle: CSSProperties = {
  ...pillBadgeStyle,
  padding: '1px 6px',
  fontSize: 11,
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
