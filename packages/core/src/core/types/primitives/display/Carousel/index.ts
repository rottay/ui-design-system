import type { ReactNode } from 'react';
import type { BaseComponentProps, WithChildren } from '../../../common';
import type { EngineAwareProps } from '../../../engine';

export type CarouselEffect = 'scrollx' | 'fade';
export type CarouselDotPosition = 'top' | 'bottom' | 'left' | 'right';
export type CarouselSize = 'sm' | 'md' | 'lg';

export interface CarouselItemProps extends BaseComponentProps, WithChildren {
  key?: string | number;
}

export interface CarouselProps extends BaseComponentProps, EngineAwareProps, WithChildren {
  autoplay?: boolean;
  autoplaySpeed?: number;
  dots?: boolean;
  dotPosition?: CarouselDotPosition;
  arrows?: boolean;
  effect?: CarouselEffect;
  slidesToShow?: number;
  slidesToScroll?: number;
  infinite?: boolean;
  speed?: number;
  initialSlide?: number;
  beforeChange?: (currentSlide: number, nextSlide: number) => void;
  afterChange?: (currentSlide: number) => void;
  pauseOnHover?: boolean;
  pauseOnDotsHover?: boolean;
  prevArrow?: ReactNode;
  nextArrow?: ReactNode;
  swipe?: boolean;
  vertical?: boolean;
  dotsClass?: string;
  fade?: boolean;
}

export interface CarouselRef {
  goTo: (slideNumber: number, dontAnimate?: boolean) => void;
  next: () => void;
  prev: () => void;
}
