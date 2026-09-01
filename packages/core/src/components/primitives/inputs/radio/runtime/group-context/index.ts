'use client';

import { createContext, useContext } from 'react';

import type { RadioSize, RadioVariant } from '../../contracts';

export interface RadioGroupContextValue {
  value: string | number | undefined;
  name: string;
  disabled?: boolean;
  size?: RadioSize;
  color?: RadioVariant;
  onChange: (value: string | number) => void;
}

/**
 * Runtime state shared by the Radio facade and its compound Group. Keeping
 * the context below engines and compounds prevents a local layer inversion.
 */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export const useRadioGroup = (): RadioGroupContextValue | null =>
  useContext(RadioGroupContext);
