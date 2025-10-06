import { ModalFuncProps } from 'antd';

export interface ConfirmModalProps extends ModalFuncProps {
    type?: 'confirm' | 'info' | 'success' | 'error' | 'warning';
}
export declare const ConfirmModal: {
    show: (props: ConfirmModalProps) => {
        destroy: () => void;
        update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
    };
    confirm: (props: ModalFuncProps) => {
        destroy: () => void;
        update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
    };
    info: (props: ModalFuncProps) => {
        destroy: () => void;
        update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
    };
    success: (props: ModalFuncProps) => {
        destroy: () => void;
        update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
    };
    error: (props: ModalFuncProps) => {
        destroy: () => void;
        update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
    };
    warning: (props: ModalFuncProps) => {
        destroy: () => void;
        update: (configUpdate: import('antd/es/modal/confirm').ConfigUpdate) => void;
    };
    destroyAll: () => void;
};
//# sourceMappingURL=ConfirmModal.d.ts.map