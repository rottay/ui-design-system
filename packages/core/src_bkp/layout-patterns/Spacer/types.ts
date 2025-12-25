import type { CSSProperties, HTMLAttributes } from 'react';

export interface SpacerProps extends HTMLAttributes<HTMLDivElement> {
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}
