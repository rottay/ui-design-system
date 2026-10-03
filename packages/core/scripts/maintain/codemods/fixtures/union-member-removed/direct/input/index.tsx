import { Space, Tooltip } from '@rottay/design-system';

export function Layout({ roomy, size }: { roomy: boolean; size: 'small' | 'large' }) {
  return (
    <>
      <Space size="small">a</Space>
      <Space size={'large'}>b</Space>
      <Space size={roomy ? 'large' : 'small'}>c</Space>
      <Space size="md">d</Space>
      <Space size={size}>e</Space>
      <Tooltip placement="left" title="f">f</Tooltip>
      <Tooltip placement="auto" title="g">g</Tooltip>
    </>
  );
}
