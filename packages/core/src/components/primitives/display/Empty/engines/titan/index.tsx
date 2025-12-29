/**
 * @fileoverview Empty Titan Engine - Rottay Design System
 * @description Ant Design-based empty state with built-in image presets.
 * Part of the Rottay Design System's display primitives collection.
 *
 * @remarks
 * This engine wraps Ant Design's Empty component to provide
 * feature-rich empty states with ecosystem consistency.
 *
 * **Exported Components:**
 * - `TitanEmpty` - Main empty state wrapper
 *
 * **Implementation Details:**
 * - Uses `antd/Empty` for core rendering
 * - Built-in PRESENTED_IMAGE_DEFAULT and PRESENTED_IMAGE_SIMPLE
 * - Consistent with Ant Design theming
 * - RTL (right-to-left) support
 *
 * **Ant Design Features:**
 * - Built-in image variants
 * - Theme token integration
 * - Accessible by default
 * - Locale support
 *
 * @example Basic Usage
 * ```tsx
 * import { Empty } from '@rottay/design-system';
 *
 * <Empty engine="titan" />
 * ```
 *
 * @example With Action
 * ```tsx
 * <Empty engine="titan" description="No items">
 *   <Button type="primary">Create Now</Button>
 * </Empty>
 * ```
 *
 * @see {@link Empty} for the main component
 * @see {@link https://ant.design/components/empty} Ant Design Empty
 * @module Empty/engines/titan
 * @category Display
 * @package @rottay/design-system
 */

'use client';

import { forwardRef } from 'react';
import { Empty as AntEmpty } from 'antd';
import type { EmptyProps } from '../../types';
import { EMPTY_DEFAULTS } from '../../types';
import { useTranslation } from '../../../../../../theme/i18n';

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
    const { t } = useTranslation('components');

    const {
      image = EMPTY_DEFAULTS.image,
      imageStyle,
      description,
      children,
      className,
      style,
    } = props;

    // Use translation as default, allow prop override
    const displayDescription = description ?? t('empty.description');

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
          description={displayDescription}
        >
          {children}
        </AntEmpty>
      </div>
    );
  }
);

TitanEmpty.displayName = 'TitanEmpty';

export default TitanEmpty;
