import { useRouterState, Skeleton } from './local';
import { useNotificationPreferences } from '@rottay/notifications';

// useRouterState from '@rottay/design-system' is retired; this file uses the app's own.
export function Screen() {
  const state = useRouterState();
  const preferences = useNotificationPreferences();
  return <Skeleton.Avatar label={`${state}${preferences}`} />;
}
