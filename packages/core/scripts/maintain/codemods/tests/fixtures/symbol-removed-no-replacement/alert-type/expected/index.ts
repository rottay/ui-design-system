import type { AlertProps, AlertType } from '@rottay/design-system';
import type { AlertType as IncidentKind } from './incidents';

type LocalAlertType = 'error' | 'info';

export const SEVERITY: Record<string, AlertType> = { failed: 'error', late: 'warning' };
export const tone: AlertProps['tone'] = 'danger';
export const local: LocalAlertType = 'error';
export const kind: IncidentKind = 'sla';
