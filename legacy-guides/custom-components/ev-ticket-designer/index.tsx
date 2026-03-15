/**
 * EvTicketDesigner - Main Export
 * Ticket type designer
 * Automatically selects preset based on props
 */

import type { EvTicketDesignerProps } from './core';
import { EV_TICKET_DESIGNER_DEFAULTS } from './core';
import { EV_TICKET_DESIGNER_PRESETS } from './presets';

export {
  type EvTicketDesignerProps,
  type EvTicketDesignerPreset,
  type TicketTypeConfig as EvTicketDesignerTicketTypeConfig,
  type PriceRule as EvTicketDesignerPriceRule,
  EV_TICKET_DESIGNER_DEFAULTS,
} from './core';
export * from './presets';

/**
 * EvTicketDesigner component
 * Renders the appropriate preset based on the preset prop
 */
export function EvTicketDesigner(props: EvTicketDesignerProps): React.ReactElement {
  const preset = props.preset ?? EV_TICKET_DESIGNER_DEFAULTS.preset ?? 'wizard';
  const PresetComponent = EV_TICKET_DESIGNER_PRESETS[preset];

  return <PresetComponent {...props} />;
}

EvTicketDesigner.displayName = 'EvTicketDesigner';

export { WizardEvTicketDesigner, FormEvTicketDesigner } from './presets';
