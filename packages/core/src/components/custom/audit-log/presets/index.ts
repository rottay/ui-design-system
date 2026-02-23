import type { AuditLogPreset, AuditLogProps } from '../core';
import type { ComponentType } from 'react';
import { Table } from './table';
import { Timeline } from './timeline';

export const PRESETS: Record<AuditLogPreset, ComponentType<AuditLogProps>> = {
  'table': Table,
  'timeline': Timeline,
};
