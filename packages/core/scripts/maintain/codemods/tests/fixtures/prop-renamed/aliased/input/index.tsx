import { TooltipValue as Value } from '@rottay/design-system';
import * as DS from '@rottay/design-system';
import { Tip, Stepper } from './ui';

export function Chart() {
  return (
    <>
      <Value color="red" label="a" value="1" />
      <DS.TooltipValue color="blue" label="b" value="2" />
      <DS.Stepper initial={1} items={[]} />
      <Tip color="green" label="c" value="3" />
      <Stepper initial={3} items={[]} />
    </>
  );
}
