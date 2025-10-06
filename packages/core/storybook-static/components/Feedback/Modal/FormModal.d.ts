import { default as React } from '../../../../../../node_modules/react';
import { ModalProps } from './types';
import { FormInstance } from 'antd';

export interface FormModalProps extends Omit<ModalProps, 'onOk'> {
    form?: FormInstance;
    onOk?: (values: any) => void | Promise<void>;
    onFinish?: (values: any) => void | Promise<void>;
    onFinishFailed?: (errorInfo: any) => void;
    preserveFormOnClose?: boolean;
}
export declare const FormModal: React.FC<FormModalProps>;
//# sourceMappingURL=FormModal.d.ts.map