import type { HTMLAttributes, ReactNode } from 'react';

export type AspectRatioPreset = 'square' | 'video' | 'portrait' | 'landscape' | 'ultrawide';

export interface AspectRatioProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Aspect ratio as preset or custom number (e.g., 1.777 for 16:9) */
  ratio?: AspectRatioPreset | number;
  /** Content to maintain aspect ratio for */
  children?: ReactNode;
}
