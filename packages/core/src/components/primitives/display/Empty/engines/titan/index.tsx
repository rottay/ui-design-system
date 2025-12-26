/**
 * Empty Component - Titan Engine (Ant Design)
 *
 * This implementation uses Ant Design's Empty component as the underlying
 * rendering engine. It provides a feature-rich empty state with built-in
 * theming and accessibility support.
 *
 * @module Empty/engines/titan
 * @category Display
 * @engine Titan
 */

'use client';

import { forwardRef } from 'react';
import { Empty as AntEmpty } from 'antd';
import type { EmptyProps } from '../../types';
import { EMPTY_DEFAULTS } from '../../types';

/**
 * Titan implementation of the Empty component.
 *
 * Uses Ant Design's Empty component which provides:
 * - Built-in default and simple image variants
 * - Consistent styling with Ant Design ecosystem
 * - RTL (right-to-left) support
 * - Accessible by default
 *
 * @example
 * ```tsx
 * // Basic usage
 * <TitanEmpty />
 *
 * // With simple image variant
 * <TitanEmpty image="simple" description="No results" />
 *
 * // With action button
 * <TitanEmpty description="No items">
 *   <Button type="primary">Create Now</Button>
 * </TitanEmpty>
 * ```
 *
 * @param props - Empty component props
 * @param ref - Forwarded ref to the container element
 * @returns Ant Design Empty component wrapped in a div
 */
const TitanEmpty = forwardRef<HTMLDivElement, EmptyProps>(
  (props, ref) => {
    const {
      image = EMPTY_DEFAULTS.image,
      imageStyle,
      description = EMPTY_DEFAULTS.description,
      children,
      className,
      style,
    } = props;

    /**
     * Maps the image prop to Ant Design's expected format.
     * Ant Design has built-in PRESENTED_IMAGE_DEFAULT and PRESENTED_IMAGE_SIMPLE.
     */
    const resolveImage = () => {
      if (image === 'default') {
        return AntEmpty.PRESENTED_IMAGE_DEFAULT;
      }
      if (image === 'simple') {
        return AntEmpty.PRESENTED_IMAGE_SIMPLE;
      }
      return image;
    };

    return (
      <div
        ref={ref}
        className={`rottay-empty rottay-empty--titan ${className || ''}`}
        style={style}
      >
        <AntEmpty
          image={resolveImage()}
          imageStyle={imageStyle}
          description={description}
        >
          {children}
        </AntEmpty>
      </div>
    );
  }
);

TitanEmpty.displayName = 'TitanEmpty';

export default TitanEmpty;
