import { TooltipValue } from '@rottay/design-system';

function Swatch(props: { color: string; label: string }) {
  return <TooltipValue {...props} value="1" />;
}

function Unrelated({ color }: { color: string }) {
  return <span style={{ color }} />;
}

export function Chart() {
  return (
    <>
      <Swatch color="red" label="a" />
      <Unrelated color="red" />
    </>
  );
}
