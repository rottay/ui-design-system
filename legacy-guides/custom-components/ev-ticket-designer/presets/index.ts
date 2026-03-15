/**
 * EvTicketDesigner - All Presets
 */

export { WizardEvTicketDesigner } from './wizard';
export { FormEvTicketDesigner } from './form';

import type { EvTicketDesignerPreset } from '../core';
import type { ComponentType } from 'react';
import type { EvTicketDesignerProps } from '../core';
import { WizardEvTicketDesigner } from './wizard';
import { FormEvTicketDesigner } from './form';

export const EV_TICKET_DESIGNER_PRESETS: Record<EvTicketDesignerPreset, ComponentType<EvTicketDesignerProps>> = {
  wizard: WizardEvTicketDesigner,
  form: FormEvTicketDesigner,
};
