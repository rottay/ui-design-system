import { TooltipValue } from '@rottay/design-system';

// <TooltipValue color="red" /> is the old spelling.
export const snippet = `<TooltipValue color="red" />`;
export const sentence = "TooltipValue color='red'";

export function Chart() {
  return <TooltipValue swatchColor="red" label={'color="red"'} value="1" />;
}
