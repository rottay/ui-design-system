import React from 'react';
import { Carousel as AntCarousel } from 'antd';
import type { CarouselProps } from './types';

export const Carousel: React.FC<CarouselProps> = (props) => {
  return <AntCarousel {...props} />;
};

Carousel.displayName = 'Carousel';
