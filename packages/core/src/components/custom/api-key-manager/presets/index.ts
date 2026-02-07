import type { ApiKeyManagerPreset } from '../core';
import { Table } from './table';
import { Cards } from './cards';

export const PRESETS: Record<ApiKeyManagerPreset, React.ComponentType<any>> = {
  'table': Table,
  'cards': Cards,
};
