import { default as React } from '../../../../../../node_modules/react';
import { ResultProps } from './types';

export interface SuccessResultProps extends Omit<ResultProps, 'status'> {
    onContinue?: () => void;
    onGoHome?: () => void;
    continueText?: string;
    goHomeText?: string;
}
export declare const SuccessResult: React.FC<SuccessResultProps>;
//# sourceMappingURL=SuccessResult.d.ts.map