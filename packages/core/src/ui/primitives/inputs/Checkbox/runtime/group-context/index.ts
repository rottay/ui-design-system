'use client';

import { createContext, useContext } from 'react';

import type { CheckboxSize, CheckboxVariant } from '../../contracts';

export interface CheckboxGroupContextValue {
  value: (string | number)[];
  name?: string;
  disabled?: boolean;
  size?: CheckboxSize;
  color?: CheckboxVariant;
  onChange: (checkedValue: string | number, checked: boolean) => void;
}

/**
 * Runtime state shared by the Checkbox facade and its compound Group.
 * It lives below both consumers so an engine never depends upward on public
 * composition.
 */
export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export const useCheckboxGroup = (): CheckboxGroupContextValue | null =>
  useContext(CheckboxGroupContext);
