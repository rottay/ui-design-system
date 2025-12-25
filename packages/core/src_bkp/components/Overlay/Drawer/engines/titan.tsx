/**
 * Titan Drawer Engine
 *
 * Adapter that converts unified DrawerProps to Ant Design Drawer.
 */

'use client';

import { Drawer as AntDrawer } from 'antd';
import type { DrawerProps } from '../../../../types/components/drawer';

/**
 * Titan Drawer - Ant Design implementation with unified DrawerProps
 */
function TitanDrawer({
  open,
  onClose,
  title,
  children,
  className,
  style,
  id,
  placement = 'right',
  width,
  height,
  closable = true,
  closeIcon,
  maskClosable = true,
  mask = true,
  maskStyle,
  keyboard = true,
  destroyOnClose,
  extra,
  footer,
  bodyStyle,
  headerStyle,
  footerStyle,
  zIndex,
  afterOpenChange,
}: DrawerProps) {
  return (
    <AntDrawer
      open={open}
      onClose={onClose}
      title={title}
      className={className}
      style={style}
      id={id}
      placement={placement}
      width={width}
      height={height}
      closable={closable}
      closeIcon={closeIcon}
      maskClosable={maskClosable}
      mask={mask}
      maskStyle={maskStyle}
      keyboard={keyboard}
      destroyOnClose={destroyOnClose}
      extra={extra}
      footer={footer}
      bodyStyle={bodyStyle}
      headerStyle={headerStyle}
      footerStyle={footerStyle}
      zIndex={zIndex}
      afterOpenChange={afterOpenChange}
    >
      {children}
    </AntDrawer>
  );
}

TitanDrawer.displayName = 'TitanDrawer';

export default TitanDrawer;
