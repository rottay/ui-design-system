import type { UserLifecyclePanelPreset } from '../core';
import { FlowUserLifecyclePanel } from './flow';
import { ActionsUserLifecyclePanel } from './actions';
import { HistoryUserLifecyclePanel } from './history';

export { FlowUserLifecyclePanel } from './flow';
export { ActionsUserLifecyclePanel } from './actions';
export { HistoryUserLifecyclePanel } from './history';

export const USER_LIFECYCLE_PANEL_PRESETS: Record<UserLifecyclePanelPreset, React.ComponentType<any>> = {
  flow: FlowUserLifecyclePanel,
  actions: ActionsUserLifecyclePanel,
  history: HistoryUserLifecyclePanel,
};
