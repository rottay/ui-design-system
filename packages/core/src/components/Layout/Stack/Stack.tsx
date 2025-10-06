import React from 'react';
import { Flex, FlexProps } from 'antd';

export interface StackProps extends Omit<FlexProps, 'vertical'> {
  /**
   * Spacing between items (alias for gap)
   */
  spacing?: number | string;
}

/**
 * Stack component for vertical flex layouts
 * This is a convenience wrapper around Ant Design's Flex component with vertical direction
 */
export const Stack: React.FC<StackProps> = ({ spacing, gap, ...props }) => {
  return <Flex vertical gap={gap ?? spacing} {...props} />;
};

Stack.displayName = 'Stack';
