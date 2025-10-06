import { default as React } from '../../../../../../node_modules/react';
import { SpinProps } from './types';

export interface SpinContainerProps extends Omit<SpinProps, 'spinning'> {
    loading?: boolean;
    children?: React.ReactNode;
    delay?: number;
    blur?: boolean;
}
export declare const SpinContainer: React.FC<SpinContainerProps>;
//# sourceMappingURL=SpinContainer.d.ts.map