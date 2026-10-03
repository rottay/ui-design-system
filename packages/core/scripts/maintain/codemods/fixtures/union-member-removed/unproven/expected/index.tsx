import { Space } from '@rottay/design-system';

function Gap(props: { size: 'small' | 'large' }) {
  return <Space {...props} />;
}

export function Layout() {
  return <Gap size="small" />;
}
