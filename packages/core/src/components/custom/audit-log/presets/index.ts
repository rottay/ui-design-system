import type { AuditLogPreset } from '../core';
import { Table } from './table';
import { Timeline } from './timeline';

export const PRESETS: Record<AuditLogPreset, React.ComponentType<any>> = {
  'table': Table,
  'timeline': Timeline,
};
