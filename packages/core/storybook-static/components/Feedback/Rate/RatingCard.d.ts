import { default as React } from '../../../../../../node_modules/react';
import { CardProps } from 'antd';
import { RateProps } from './types';

export interface RatingCardProps extends Omit<CardProps, 'onChange'> {
    rateProps?: RateProps;
    title?: React.ReactNode;
    description?: React.ReactNode;
    value?: number;
    onChange?: (value: number) => void;
    showCount?: boolean;
    count?: number;
    averageRating?: number;
    vertical?: boolean;
}
export declare const RatingCard: React.FC<RatingCardProps>;
//# sourceMappingURL=RatingCard.d.ts.map