import { Stepper, TooltipValue, type StepperProps } from '@rottay/design-system';

const seeded = { initial: 2 } satisfies StepperProps;

export function Chart(props: { color: string }) {
  return (
    <>
      <TooltipValue {...props} label="a" value="1" />
      <TooltipValue color="red" swatchColor="blue" label="b" value="2" />
      <Stepper {...seeded} items={[]} />
    </>
  );
}
