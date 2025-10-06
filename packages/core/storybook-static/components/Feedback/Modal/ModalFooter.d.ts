import { default as React } from '../../../../../../node_modules/react';
import { ButtonProps } from 'antd';

export interface ModalFooterProps {
    children?: React.ReactNode;
    okText?: string;
    cancelText?: string;
    onOk?: () => void;
    onCancel?: () => void;
    okButtonProps?: ButtonProps;
    cancelButtonProps?: ButtonProps;
    align?: 'left' | 'center' | 'right';
    className?: string;
    style?: React.CSSProperties;
}
export declare const ModalFooter: React.FC<ModalFooterProps>;
//# sourceMappingURL=ModalFooter.d.ts.map