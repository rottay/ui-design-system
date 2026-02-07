import stepper from './stepper';
import tabs from './tabs';
import cardStack from './card-stack';

export { stepper, tabs, cardStack };

export const PRESETS = {
  stepper,
  tabs,
  'card-stack': cardStack,
} as const;
