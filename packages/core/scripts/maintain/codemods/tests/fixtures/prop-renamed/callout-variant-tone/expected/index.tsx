import { Callout, type CalloutProps } from '@rottay/design-system';

const shared: CalloutProps = { children: 'Saved' };

function Banner({ variant }: { variant: 'error' | 'info' }) {
  return <p data-variant={variant} />;
}

export function Notices({ offline }: { offline: boolean }) {
  return (
    <>
      <Callout tone="warning" title="Offline">Reconnect to continue.</Callout>
      <Callout tone="danger" title="Rejected" closable>
        A required approval is missing.
      </Callout>
      <Callout
        tone={'info'}
        title="Period open"
      >
        Twelve records await review.
      </Callout>
      <Callout tone="success">Approved.</Callout>
      <Callout variant={offline ? 'error' : 'info'}>Depends on the connection.</Callout>
      <Callout tone="danger" variant="error">Both.</Callout>
      <Callout {...shared} />
      <Banner variant="error" />
    </>
  );
}
