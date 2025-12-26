/**
 * @fileoverview Carousel Item Compound Component
 * @description Provides a styled wrapper for individual carousel slides
 * with consistent layout and optional background customization.
 * @module components/primitives/display/Carousel/compound/Item
 */

'use client';

import React, { forwardRef } from 'react';
import type { CarouselItemProps } from '../../types';

/**
 * Props for the CarouselItem component.
 */
export interface CarouselItemComponentProps extends CarouselItemProps {
  /** Background color for the slide */
  backgroundColor?: string;
  /** Background image URL */
  backgroundImage?: string;
  /** Content alignment */
  align?: 'start' | 'center' | 'end';
  /** Vertical content alignment */
  justify?: 'start' | 'center' | 'end';
}

/**
 * CarouselItem - A styled container for individual carousel slides.
 * Provides consistent layout and styling for slide content.
 *
 * @component
 * @example
 * ```tsx
 * <Carousel>
 *   <Carousel.Item backgroundColor="#f0f0f0">
 *     <h2>Slide Content</h2>
 *   </Carousel.Item>
 * </Carousel>
 * ```
 *
 * @param {CarouselItemComponentProps} props - Component props
 * @param {React.Ref<HTMLDivElement>} ref - Forwarded ref
 * @returns {React.ReactElement} Rendered carousel item
 */
export const CarouselItem = forwardRef<HTMLDivElement, CarouselItemComponentProps>(
  (props, ref) => {
    const {
      children,
      backgroundColor,
      backgroundImage,
      align = 'center',
      justify = 'center',
      className = '',
      style,
    } = props;

    const alignmentMap = {
      start: 'flex-start',
      center: 'center',
      end: 'flex-end',
    };

    const itemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: alignmentMap[justify],
      justifyContent: alignmentMap[align],
      width: '100%',
      height: '100%',
      backgroundColor,
      backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      ...style,
    };

    return (
      <div
        ref={ref}
        className={`rottay-carousel__item ${className}`}
        style={itemStyle}
      >
        {children}
      </div>
    );
  }
);

CarouselItem.displayName = 'CarouselItem';
