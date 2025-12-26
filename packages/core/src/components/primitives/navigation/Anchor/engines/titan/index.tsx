'use client';

/**
 * Anchor - Titan Engine (Ant Design)
 */
import React from 'react';
import { Anchor as AntAnchor } from 'antd';
import type { AnchorProps, AnchorLinkProps } from '../../types';

export const Anchor = React.forwardRef<HTMLDivElement, AnchorProps>(
  (props, _ref) => {
    const {
      getContainer,
      activeKey,
      offsetTop,
      offsetBottom,
      bounds,
      showInkInFixed,
      onChange,
      onClick,
      direction,
      affix,
      children,
      className,
      style,
    } = props;

    return (
      <AntAnchor
        getContainer={getContainer}
        getCurrentAnchor={activeKey ? () => activeKey : undefined}
        offsetTop={offsetTop}
        targetOffset={offsetBottom}
        bounds={bounds}
        showInkInFixed={showInkInFixed}
        onChange={onChange}
        onClick={onClick}
        direction={direction}
        affix={affix}
        className={className}
        style={style}
      >
        {children}
      </AntAnchor>
    );
  }
);
Anchor.displayName = 'Anchor.Titan';

export const Link = React.forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (props, _ref) => {
    const { href, title, target, replace, children, className } = props;

    return (
      <AntAnchor.Link
        href={href}
        title={title}
        target={target}
        replace={replace}
        className={className}
      >
        {children}
      </AntAnchor.Link>
    );
  }
);
Link.displayName = 'Anchor.Link.Titan';

export default Anchor;
