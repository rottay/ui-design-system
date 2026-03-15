import type { ApiKeyManagerPreset, ApiKeyManagerProps } from '../core';
import type { ComponentType } from 'react';
import { Table } from './table';
import { Cards } from './cards';

export const PRESETS: Record<ApiKeyManagerPreset, ComponentType<ApiKeyManagerProps>> = {
  'table': Table,
  'cards': Cards,
};
