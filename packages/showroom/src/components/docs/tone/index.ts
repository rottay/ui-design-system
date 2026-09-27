import type { CSSProperties, ElementType, ReactNode } from 'react';

export type DocsTone = 'default' | 'accent' | 'success' | 'warning';

export type DocsBaseProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  [key: string]: any;
};

export const DOCS_PANEL_BORDER = '1px solid var(--ds-color-border-subtle, var(--ds-color-neutral-200))';
export const DOCS_CARD_SURFACE = 'var(--ds-surface-card, var(--ds-color-bg-elevated, var(--ds-color-neutral-50)))';
export const DOCS_PANEL_SURFACE = 'var(--ds-surface-panel, var(--ds-color-bg-tertiary, var(--ds-color-neutral-100)))';
export const DOCS_PANEL_SHADOW = '0 22px 52px var(--ds-color-shadow, rgba(0, 0, 0, 0.22))';
export const DOCS_DIVIDER = 'linear-gradient(90deg, var(--ds-color-border-subtle, var(--ds-color-neutral-200)), transparent)';

/** The eyebrow/label treatment every docs piece shares. */
export const DOCS_EYEBROW: CSSProperties = {
  fontSize: '0.75rem',
  fontWeight: 600,
  display: 'block',
  color: 'var(--ds-color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
};

function tinted(token: string, surfacePercent: number) {
  return {
    background: `linear-gradient(180deg, color-mix(in srgb, var(${token}) ${surfacePercent}%, var(--ds-surface-card, var(--ds-color-bg-elevated))) 0%, var(--ds-surface-card, var(--ds-color-bg-elevated)) 100%)`,
    divider: `linear-gradient(90deg, color-mix(in srgb, var(${token}) 22%, var(--ds-color-border-subtle, var(--ds-color-neutral-200))), transparent)`,
  };
}

export function resolveDocsTone(tone: DocsTone): { background: string; divider: string } {
  switch (tone) {
    case 'accent':
      return tinted('--ds-color-primary-500', 6);
    case 'success':
      return tinted('--ds-color-success-500', 7);
    case 'warning':
      return tinted('--ds-color-warning-500', 7);
    default:
      return { background: DOCS_CARD_SURFACE, divider: DOCS_DIVIDER };
  }
}
