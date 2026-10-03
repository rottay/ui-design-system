import { Alert } from '@rottay/design-system';

export function Notices({ kind }: { kind: 'error' | 'info' }) {
  return (
    <>
      <Alert tone="danger" title="a" />
      <Alert tone={'success'} title="b" />
      <Alert type={kind} title="c" />
      <Alert type="loading" title="d" />
    </>
  );
}
