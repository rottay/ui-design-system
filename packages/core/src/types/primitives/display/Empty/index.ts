import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

export type EmptyImageType = 'default' | 'simple' | 'custom';

export interface EmptyProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  image?: ReactNode | 'default' | 'simple';
  imageStyle?: React.CSSProperties;
  description?: ReactNode;
}
