import { Stepper, TooltipValue } from '@rottay/design-system';

export function Chart({ color, step }: { color: string; step: number }) {
  return (
    <>
      <TooltipValue swatchColor={color} label="Revenue" value="12" />
      <TooltipValue label="Cost" swatchColor="var(--ds-color-danger)" value="3" />
      <Stepper defaultCurrent={step} items={[]} />
      <Stepper
        items={[]}
        defaultCurrent={2}
      />
    </>
  );
}
