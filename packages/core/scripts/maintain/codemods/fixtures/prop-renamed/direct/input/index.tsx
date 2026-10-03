import { Stepper, TooltipValue } from '@rottay/design-system';

export function Chart({ color, step }: { color: string; step: number }) {
  return (
    <>
      <TooltipValue color={color} label="Revenue" value="12" />
      <TooltipValue label="Cost" color="var(--ds-color-danger)" value="3" />
      <Stepper initial={step} items={[]} />
      <Stepper
        items={[]}
        initial={2}
      />
    </>
  );
}
