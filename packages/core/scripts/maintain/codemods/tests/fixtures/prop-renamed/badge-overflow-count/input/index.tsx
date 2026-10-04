import { Badge, type BadgeProps } from '@rottay/design-system';
import { Badge as AntBadge } from 'antd';

const shared: BadgeProps = { count: 3 };

export function Counters({ total, cap }: { total: number; cap: number }) {
  return (
    <>
      <Badge count={total} overflowCount={99} />
      <Badge
        count={total}
        overflowCount={cap}
      >
        <span>Inbox</span>
      </Badge>
      <Badge count={total} max={9} overflowCount={99} />
      <Badge {...shared} count={total} />
      <AntBadge count={total} overflowCount={999} />
    </>
  );
}
