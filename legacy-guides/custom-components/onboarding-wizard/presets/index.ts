import type { ComponentType } from 'react';
import type { OnboardingWizardPreset, OnboardingWizardProps } from '../core';

import stepperPreset from './stepper';
import cardsPreset from './cards';
import minimalPreset from './minimal';

export const stepper = stepperPreset;
export const cards = cardsPreset;
export const minimal = minimalPreset;

export const PRESETS: Record<OnboardingWizardPreset, ComponentType<OnboardingWizardProps>> = {
  stepper: stepperPreset,
  cards: cardsPreset,
  minimal: minimalPreset,
};
