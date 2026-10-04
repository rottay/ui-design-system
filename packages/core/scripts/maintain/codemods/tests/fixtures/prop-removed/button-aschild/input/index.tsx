import { Button, type ButtonProps } from '@rottay/design-system';

const shared: ButtonProps = { variant: 'secondary' };

function Slot({ asChild }: { asChild?: boolean }) {
  return <span data-slot={asChild ? 'child' : 'self'} />;
}

export function Links({ track }: { track: () => boolean }) {
  return (
    <>
      <Button asChild variant="secondary" size="sm">
        <a href="/reports">Reports</a>
      </Button>
      <Button
        variant="ghost"
        asChild={true}
      >
        <a href="/settings">Settings</a>
      </Button>
      <Button asChild={track()}>
        <a href="/audit">Audit</a>
      </Button>
      <Button {...shared}>Plain</Button>
      <Slot asChild />
    </>
  );
}
