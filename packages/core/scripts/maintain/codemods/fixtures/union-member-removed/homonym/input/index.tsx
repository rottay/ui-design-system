import { Button } from '@rottay/design-system';
import { Space } from './local';
import { Tooltip } from 'other-kit';

// <Space size="small" /> in a comment.
export function Layout() {
  return (
    <>
      <Space size="small" />
      <Tooltip placement="left" />
      <Button size="small">design-system component, different prop owner</Button>
      <span title={'size="small"'} />
    </>
  );
}
