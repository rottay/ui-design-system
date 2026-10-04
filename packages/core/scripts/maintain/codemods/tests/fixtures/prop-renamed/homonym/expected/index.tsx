import { Segmented, Text, TooltipSeries } from '@rottay/design-system';
import { TooltipValue } from './local';
import { Stepper } from 'other-kit';

export function Chart() {
  return (
    <>
      <TooltipValue color="red" />
      <Stepper initial={1} />
      <Segmented initial={1} options={[]} />
      <Text color="muted">plain</Text>
      <TooltipSeries items={[{ color: 'red', label: 'a', value: '1' }]} />
    </>
  );
}
