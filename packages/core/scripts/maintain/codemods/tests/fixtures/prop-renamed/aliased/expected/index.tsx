import { TooltipValue as Value } from '@rottay/design-system';
import * as DS from '@rottay/design-system';
import { Tip, Stepper } from './ui';

export function Chart() {
  return (
    <>
      <Value swatchColor="red" label="a" value="1" />
      <DS.TooltipValue swatchColor="blue" label="b" value="2" />
      <DS.Stepper defaultCurrent={1} items={[]} />
      <Tip swatchColor="green" label="c" value="3" />
      <Stepper defaultCurrent={3} items={[]} />
    </>
  );
}
