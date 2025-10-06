import { default as React } from '../../../../../../node_modules/react';
import { TourProps, TourStepProps } from 'antd';

export interface GuidedTourStep extends Omit<TourStepProps, 'target'> {
    target?: (() => HTMLElement | null) | (() => HTMLElement) | HTMLElement | null;
    title: React.ReactNode;
    description?: React.ReactNode;
}
export interface GuidedTourProps extends Omit<TourProps, 'steps'> {
    steps: GuidedTourStep[];
    autoStart?: boolean;
    onComplete?: () => void;
    onSkip?: () => void;
    showProgress?: boolean;
    allowSkip?: boolean;
    skipText?: string;
    finishText?: string;
    nextText?: string;
    prevText?: string;
}
export declare const GuidedTour: React.FC<GuidedTourProps>;
export declare const useGuidedTour: () => {
    open: boolean;
    current: number;
    start: () => void;
    close: () => void;
    next: () => void;
    prev: () => void;
    goTo: (step: number) => void;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setCurrent: React.Dispatch<React.SetStateAction<number>>;
};
//# sourceMappingURL=GuidedTour.d.ts.map