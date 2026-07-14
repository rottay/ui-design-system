/**
 * @fileoverview Carousel Item Component - Rottay Design System
 * @description Styled slide wrapper with background and alignment options.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * The CarouselItem component provides a styled container for individual slides
 * with background customization and content alignment options.
 *
 * **Exported Components:**
 * - `CarouselItem` - Styled slide wrapper
 *
 * **Props:**
 * - `backgroundColor` - Solid background color
 * - `backgroundImage` - Background image URL
 * - `align` - Horizontal alignment ('start' | 'center' | 'end')
 * - `justify` - Vertical alignment ('start' | 'center' | 'end')
 *
 * **Implementation Details:**
 * - Flexbox-based content alignment
 * - Background image with cover sizing
 * - Full-size slide container
 * - Ref forwarding support
 *
 * @example Basic Usage
 * ```tsx
 * <Carousel.Item backgroundColor="var(--ds-color-neutral-100)">
 *   <h2>Slide Content</h2>
 * </Carousel.Item>
 * ```
 *
 * @example With Background Image
 * ```tsx
 * <Carousel.Item
 *   backgroundImage="/hero.jpg"
 *   align="center"
 *   justify="end"
 * >
 *   <h2>Hero Title</h2>
 * </Carousel.Item>
 * ```
 *
 * @see {@link Carousel} for parent component
 * @module Carousel/compound/Item
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import React, { forwardRef } from 'react';
import type { CarouselItemProps } from '../../Carousel.types';

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
 *   <Carousel.Item backgroundColor="var(--ds-color-neutral-100)">
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

    // Both backgrounds are caller-supplied strings (a colour and a URL), so
    // carousel-compounds.css consumes them as custom properties rather than
    // enumerating them.
    const itemStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: alignmentMap[justify],
      justifyContent: alignmentMap[align],
      width: '100%',
      height: '100%',
      '--ds-carousel-item-bg': backgroundColor,
      '--ds-carousel-item-bg-image': backgroundImage ? `url(${backgroundImage})` : undefined,
      ...style,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={`rottay-carousel__item ${className}`}
        data-part="item"
        style={itemStyle}
      >
        {children}
      </div>
    );
  }
);

CarouselItem.displayName = 'CarouselItem';
