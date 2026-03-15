/**
 * EvTicketDesigner - Core Interface
 * Ticket type designer
 */

import type { ReactNode, CSSProperties } from 'react';
import type { EngineAwareProps } from '../../../../core/types';

export type EvTicketDesignerPreset = 'wizard' | 'form';

export interface TicketTypeConfig {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  salesStart: Date;
  salesEnd: Date;
  isVip: boolean;
  perks: string[];
}

export interface PriceRule {
  id: string;
  name: string;
  type: "early-bird" | "group" | "promo";
  discount: number;
  validUntil: Date;
  code?: string;
}

export interface EvTicketDesignerProps extends EngineAwareProps {
  preset?: EvTicketDesignerPreset;
  ticketTypes?: TicketTypeConfig[];
  priceRules?: PriceRule[];
  onSave?: (config: TicketTypeConfig) => void;
  onAddPriceRule?: (rule: PriceRule) => void;
  className?: string;
  style?: CSSProperties;
}

export const EV_TICKET_DESIGNER_DEFAULTS: Partial<EvTicketDesignerProps> = {
  preset: 'wizard',

};
