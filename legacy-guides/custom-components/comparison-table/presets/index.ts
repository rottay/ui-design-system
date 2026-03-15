import type { ComparisonTableProps, ComparisonTablePreset } from '../core';
import { TablePreset } from './table';
import { CardsPreset } from './cards';

export const PRESETS: Record<ComparisonTablePreset, React.ComponentType<ComparisonTableProps>> = {
  table: TablePreset,
  cards: CardsPreset,
};
