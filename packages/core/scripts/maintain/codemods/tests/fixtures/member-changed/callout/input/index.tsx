import { Alert, Callout } from '@rottay/design-system';

function LocalCallout({ title }: { title: string }) {
  return <aside>{title}</aside>;
}

export function Notices() {
  return (
    <>
      <Callout tone="warning" title="Offline" action={<button type="button">Retry</button>}>
        Reconnect to continue.
      </Callout>
      <Alert tone="info" message="Period open" />
      <LocalCallout title="Not the design system" />
    </>
  );
}
