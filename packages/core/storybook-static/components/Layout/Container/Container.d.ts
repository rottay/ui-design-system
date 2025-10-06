import { default as React } from '../../../../../../node_modules/react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Maximum width of the container
     * @default 'lg'
     */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | number;
}
/**
 * Container component for centered, max-width layouts
 * This is a custom component not present in Ant Design
 */
export declare const Container: React.FC<ContainerProps>;
//# sourceMappingURL=Container.d.ts.map