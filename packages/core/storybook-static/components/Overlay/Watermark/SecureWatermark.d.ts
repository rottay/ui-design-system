import { default as React } from '../../../../../../node_modules/react';
import { WatermarkProps } from 'antd';

export interface SecureWatermarkProps extends WatermarkProps {
    username?: string;
    userId?: string;
    timestamp?: boolean;
    ipAddress?: string;
    sessionId?: string;
    customFields?: Record<string, string>;
    multiLine?: boolean;
    showMetadata?: boolean;
}
export declare const SecureWatermark: React.FC<SecureWatermarkProps>;
//# sourceMappingURL=SecureWatermark.d.ts.map