import type { SurfaceTabbedView } from '@rottay/design-system';

interface LocalTab {
  key: string;
  permissionId?: string;
}

export const local: LocalTab = { key: 'audit', permissionId: 'audit' };

export const views: SurfaceTabbedView[] = [
  { key: 'general', label: 'General', content: null },
  { key: 'payments', label: 'Payments', content: null, permissionId: 'billing' },
];
