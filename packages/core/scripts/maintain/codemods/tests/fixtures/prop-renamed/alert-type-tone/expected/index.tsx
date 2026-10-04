import { Alert, type AlertProps } from '@rottay/design-system';
import { Alert as AntAlert } from 'antd';

const shared: AlertProps = { message: 'Saved' };

export function Notices({ failed, kind }: { failed: boolean; kind: 'error' | 'info' }) {
  return (
    <>
      <Alert tone="danger" message="Rejected" showIcon />
      <Alert tone="warning" message="Closing soon" />
      <Alert
        tone={'success'}
        message="Approved"
        closable
      />
      <Alert tone="info" message="Period open" />
      <Alert type={kind} message="Depends" />
      <Alert type={failed ? 'error' : 'info'} message="Ternary" />
      <Alert tone="danger" type="error" message="Both" />
      <Alert {...shared} />
      <AntAlert type="error" message="Not the design system" />
    </>
  );
}
