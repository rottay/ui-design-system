import { Alert } from '@rottay/design-system';

export function Notices({ kind }: { kind: 'error' | 'info' }) {
  return (
    <>
      <Alert type="error" title="a" />
      <Alert type={'success'} title="b" />
      <Alert type={kind} title="c" />
      <Alert type="loading" title="d" />
    </>
  );
}
