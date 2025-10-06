import { default as React } from '../../../../../../node_modules/react';
import { FlexProps } from 'antd';

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
export declare const Stack: React.FC<StackProps>;
//# sourceMappingURL=Stack.d.ts.map