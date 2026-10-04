import type { CalloutTone, CalloutVariant } from '@rottay/design-system';

type LocalVariant = 'error' | 'info';

export const SEVERITY: Record<string, CalloutVariant> = { failed: 'error', late: 'warning' };
export const TONES: CalloutTone[] = ['danger', 'warning'];
export const local: LocalVariant = 'error';
