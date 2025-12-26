/**
 * Mentions - Engine Router
 */
import { createEngineComponent } from '../../../../system/engines/factory';
import type { MentionsProps } from './types';

export {
  type MentionsProps,
  type MentionsOption,
  type MentionsPlacement,
  type MentionsStatus,
  MENTIONS_DEFAULTS,
} from './types';

export const Mentions = createEngineComponent<MentionsProps>('Mentions', {
  titan: () => import('./engines/titan'),
  hermes: () => import('./engines/hermes'),
  apollo: () => import('./engines/apollo'),
});

export default Mentions;
