/**
 * @fileoverview Classic engine for the Empty component, backed by Ant Design.
 * Wraps antd's Empty to provide built-in image presets (default/simple),
 * i18n-aware description text, and optional action children.
 *
 * @example
 * ```tsx
 * <Empty engine="classic" description="No items">
 *   <Button type="primary">Create Now</Button>
 * </Empty>
 * ```
 */

'use client';

import { forwardRef } from 'react';
import { Empty as AntEmpty } from 'antd';
import type { EmptyProps } from '../Empty.types';
import { EMPTY_DEFAULTS } from '../Empty.types';
import { useTranslation } from '../../../../../i18n';

/**
 * Classic (Ant Design) implementation of the Empty component.
 *
 * Maps the DS image prop ("default" | "simple" | ReactNode) to Ant Design's
 * built-in PRESENTED_IMAGE constants. Falls through to the i18n translation
 * system for the default description text so the empty state is localised.
 *
 * @param props - Unified EmptyProps from the design system type contract
 * @param ref - Forwarded ref attached to the outer wrapper div
 * @returns Ant Design Empty wrapped in a ref-able container
 */
const ClassicEmpty = forwardRef<HTMLDivElement, EmptyProps>(
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

    // i18n translation provides the default "No data" text; explicit prop overrides it
    const displayDescription = description ?? t('empty.description');

    // Resolve string shorthand ("default"/"simple") to Ant Design's built-in
    // SVG constants; pass ReactNode images through unchanged for custom illustrations
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
        className={`rottay-empty rottay-empty--classic ${className || ''}`}
        style={style}
      >
        <AntEmpty
          image={resolveImage()}
          styles={imageStyle ? { image: imageStyle } : undefined}
          description={displayDescription}
        >
          {children}
        </AntEmpty>
      </div>
    );
  }
);

ClassicEmpty.displayName = 'ClassicEmpty';

export default ClassicEmpty;
