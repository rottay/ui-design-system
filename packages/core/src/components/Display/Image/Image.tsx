import React from 'react';
import { Image as AntImage } from 'antd';
import type { ImageProps } from './types';

export const Image: React.FC<ImageProps> = (props) => {
  return <AntImage {...props} />;
};

Image.displayName = 'Image';
