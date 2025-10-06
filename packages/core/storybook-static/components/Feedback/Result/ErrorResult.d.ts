import { default as React } from '../../../../../../node_modules/react';
import { ResultProps } from './types';

export interface ErrorResultProps extends Omit<ResultProps, 'status'> {
    onRetry?: () => void;
    onGoBack?: () => void;
    retryText?: string;
    goBackText?: string;
    errorCode?: string | number;
}
export declare const ErrorResult: React.FC<ErrorResultProps>;
//# sourceMappingURL=ErrorResult.d.ts.map