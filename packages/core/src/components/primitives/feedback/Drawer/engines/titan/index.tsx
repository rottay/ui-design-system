/**
 * Drawer - Titan Engine (Ant Design)
 */

import React from 'react';
import { Drawer as AntDrawer } from 'antd';
import type { DrawerProps } from '../types';
import { DRAWER_DEFAULTS } from '../types';

const SIZE_MAP = {
  sm: 256,
  md: 378,
  lg: 520,
  xl: 736,
  full: '100%',
};

export default function TitanDrawer(props: DrawerProps): React.ReactElement {
  const {
    open,
    placement = DRAWER_DEFAULTS.placement,
    size = DRAWER_DEFAULTS.size,
    title,
    onClose,
    onOpenChange,
    closable = DRAWER_DEFAULTS.closable,
    closeOnOverlayClick = DRAWER_DEFAULTS.closeOnOverlayClick,
    closeOnEscape = DRAWER_DEFAULTS.closeOnEscape,
    footer,
    hideFooter,
    children,
    zIndex = DRAWER_DEFAULTS.zIndex,
    width,
    height,
    mask = DRAWER_DEFAULTS.mask,
    className,
    style,
  } = props;

  const handleClose = () => {
    onClose?.();
    onOpenChange?.(false);
  };

  // Determine width/height based on placement and size
  const isHorizontal = placement === 'left' || placement === 'right';
  const drawerWidth = width || (isHorizontal ? SIZE_MAP[size!] : undefined);
  const drawerHeight = height || (!isHorizontal ? SIZE_MAP[size!] : undefined);

  return (
    <AntDrawer
      open={open}
      placement={placement}
      title={title}
      onClose={handleClose}
      closable={closable}
      maskClosable={closeOnOverlayClick}
      keyboard={closeOnEscape}
      footer={hideFooter ? null : footer}
      width={drawerWidth}
      height={drawerHeight}
      zIndex={zIndex}
      mask={mask}
      className={className}
      style={style}
    >
      {children}
    </AntDrawer>
  );
}
