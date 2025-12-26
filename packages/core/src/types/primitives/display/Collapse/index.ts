import type { ReactNode, Key } from 'react';
import type { BaseComponentProps, WithChildren, Size } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

export type CollapseSize = Size;
export type CollapseExpandIconPosition = 'start' | 'end';

export interface CollapsePanelProps extends BaseComponentProps, WithChildren {
  key: Key;
  header: ReactNode;
  disabled?: boolean;
  showArrow?: boolean;
  extra?: ReactNode;
  forceRender?: boolean;
  collapsible?: 'header' | 'icon' | 'disabled';
}

export interface CollapseItemType {
  key: Key;
  label: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  showArrow?: boolean;
  extra?: ReactNode;
  forceRender?: boolean;
  collapsible?: 'header' | 'icon' | 'disabled';
  className?: string;
  style?: React.CSSProperties;
}

export interface CollapseProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  accordion?: boolean;
  activeKey?: Key | Key[];
  defaultActiveKey?: Key | Key[];
  bordered?: boolean;
  expandIcon?: (panelProps: { isActive: boolean }) => ReactNode;
  expandIconPosition?: CollapseExpandIconPosition;
  ghost?: boolean;
  size?: CollapseSize;
  items?: CollapseItemType[];
  onChange?: (key: Key | Key[]) => void;
  destroyInactivePanel?: boolean;
  collapsible?: 'header' | 'icon' | 'disabled';
}
