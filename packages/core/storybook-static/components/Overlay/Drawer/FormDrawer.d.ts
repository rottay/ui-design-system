import { default as React } from '../../../../../../node_modules/react';
import { DrawerProps, FormInstance } from 'antd';

export interface FormDrawerProps extends Omit<DrawerProps, 'onClose'> {
    form?: FormInstance;
    onFinish?: (values: any) => void | Promise<void>;
    onFinishFailed?: (errorInfo: any) => void;
    onClose?: () => void;
    submitText?: string;
    cancelText?: string;
    preserveFormOnClose?: boolean;
    showFooter?: boolean;
}
export declare const FormDrawer: React.FC<FormDrawerProps>;
//# sourceMappingURL=FormDrawer.d.ts.map