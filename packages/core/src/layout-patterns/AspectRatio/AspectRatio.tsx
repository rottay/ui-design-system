import React from 'react';
import type { AspectRatioProps } from './types';

const ratioPresets = {
  square: 1,
  video: 16 / 9,
  portrait: 3 / 4,
  landscape: 4 / 3,
  ultrawide: 21 / 9,
};

/**
 * AspectRatio component
 * Maintains aspect ratio for content (images, videos, iframes)
 */
export const AspectRatio: React.FC<AspectRatioProps> = ({
  ratio = 'video',
  children,
  style,
  className,
  ...rest
}) => {
  const ratioValue = typeof ratio === 'number' ? ratio : ratioPresets[ratio];

  // Calculate padding-bottom percentage (height / width * 100)
  const paddingBottom = `${(1 / ratioValue) * 100}%`;

  const outerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    paddingBottom,
    ...style,
  };

  const innerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  };

  return (
    <div style={outerStyle} className={className} {...rest}>
      <div style={innerStyle}>{children}</div>
    </div>
  );
};

AspectRatio.displayName = 'AspectRatio';
