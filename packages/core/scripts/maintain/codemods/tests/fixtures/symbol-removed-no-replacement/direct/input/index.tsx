import { Skeleton, useRouterState, type SurfacePermissionRule } from '@rottay/design-system';
import * as DS from '@rottay/design-system';

export function Screen({ rule }: { rule: SurfacePermissionRule }) {
  const state = useRouterState({ key: 'tab' });
  const defaults = DS.STEPS_DEFAULTS;
  return (
    <Skeleton active>
      <Skeleton.Avatar />
      {String(state)}
      {String(defaults)}
      {String(rule)}
    </Skeleton>
  );
}
