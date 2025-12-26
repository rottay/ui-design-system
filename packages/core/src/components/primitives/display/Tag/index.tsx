'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { TagProps } from './types';
import { TitanTag, HermesTag, ApolloTag } from './engines';

/**
 * Tag component with engine-aware rendering.
 *
 * Automatically selects the appropriate engine implementation based on the
 * engine prop or EngineProvider context.
 *
 * @example
 * ```tsx
 * <Tag color="primary" closable onClose={() => console.log('closed')}>
 *   Premium
 * </Tag>
 * ```
 */
export const Tag = forwardRef<HTMLSpanElement, TagProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const engineMap: Record<string, ForwardRefExoticComponent<TagProps & RefAttributes<HTMLSpanElement>>> = {
      titan: TitanTag,
      hermes: HermesTag,
      apollo: ApolloTag,
    };

    const Component = engineMap[engine] || TitanTag;
    return <Component ref={ref} {...props} />;
  }
);

Tag.displayName = 'Tag';

// Export types
export type { TagProps, TagSize, TagVariant, TagColor } from './types';
