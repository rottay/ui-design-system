/**
 * Result - Engine Router
 * Display status of an operation
 */

import { createEngineComponent } from '../../../../system/engines/factory';
import type { ResultProps } from './types';

export {
  type ResultProps,
  type ResultStatus,
  RESULT_DEFAULTS,
  RESULT_ICONS,
  RESULT_COLORS,
} from './types';

export const Result = createEngineComponent<ResultProps>('Result', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Result;
