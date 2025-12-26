'use client';

import { forwardRef } from 'react';
import type { ForwardRefExoticComponent, RefAttributes } from 'react';
import type { TooltipProps } from './types';
import { TitanTooltip, HermesTooltip, ApolloTooltip } from './engines';
import { TooltipTrigger, TooltipContent } from './compound';

/**
 * Tooltip component with engine-aware rendering.
 *
 * Automatically selects the appropriate engine implementation based on the
 * engine prop or EngineProvider context.
 *
 * @example
 * ```tsx
 * <Tooltip content="Helpful information" placement="top">
 *   <Button>Hover me</Button>
 * </Tooltip>
 * ```
 */
export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  ({ engine = 'titan', ...props }, ref) => {
    const engineMap: Record<string, ForwardRefExoticComponent<TooltipProps & RefAttributes<HTMLDivElement>>> = {
      titan: TitanTooltip,
      hermes: HermesTooltip,
      apollo: ApolloTooltip,
    };

    const Component = engineMap[engine] || TitanTooltip;
    return <Component ref={ref} {...props} />;
  }
) as ForwardRefExoticComponent<TooltipProps & RefAttributes<HTMLDivElement>> & {
  Trigger: typeof TooltipTrigger;
  Content: typeof TooltipContent;
};

// Attach compound components
Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;

Tooltip.displayName = 'Tooltip';

// Export types
export type { TooltipProps, TooltipTriggerProps, TooltipContentProps, TooltipPlacement, TooltipTrigger as TooltipTriggerType } from './types';
