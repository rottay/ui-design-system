import { TooltipValue } from '@/ui/chart';
import { Stepper } from './missing';
import './styles.css';
import logo from './logo.svg';
import { useState } from 'react';

export function Chart() {
  const [step] = useState(1);
  return (
    <>
      <TooltipValue color="red" />
      <Stepper initial={step} />
      {String(logo)}
    </>
  );
}
