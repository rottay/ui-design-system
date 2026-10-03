import { Space } from '@rottay/design-system';

export function Row({ wide }: { wide: boolean }) {
  return (
    <>
      <Space size="small">a</Space>
      <Space size={wide ? 'small' : 'md'}>b</Space>
    </>
  );
}
