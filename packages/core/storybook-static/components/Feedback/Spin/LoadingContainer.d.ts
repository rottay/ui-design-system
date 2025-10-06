import { default as React } from '../../../../../../node_modules/react';
import { SpinProps } from './types';

export interface LoadingContainerProps extends SpinProps {
    loading?: boolean;
    children?: React.ReactNode;
    minHeight?: number | string;
    fullHeight?: boolean;
}
export declare const LoadingContainer: React.FC<LoadingContainerProps>;
//# sourceMappingURL=LoadingContainer.d.ts.map