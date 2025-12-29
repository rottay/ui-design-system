import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

/**
 * @deprecated Comment component is deprecated in Ant Design 5.
 * Consider using a custom implementation or a different component.
 */
export interface CommentProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  author?: ReactNode;
  avatar?: ReactNode;
  content: ReactNode;
  datetime?: ReactNode;
  actions?: ReactNode[];
}
