import { charts } from '../charts';
import { icons } from '../icons';
import { patterns } from '../patterns';
import { primitives } from '../primitives';
import { structures } from '../structures';
import { surfaces } from '../surfaces';

const counts = {
  primitives: primitives.length,
  patterns: patterns.length,
  structures: structures.length,
  surfaces: surfaces.length,
  charts: charts.length,
  icons: icons.length,
};

/** Documented assets per registry, read off the registry itself. */
export const DOC_COUNTS = {
  ...counts,
  total: Object.values(counts).reduce((sum, count) => sum + count, 0),
};
