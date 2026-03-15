import type { UserLifecyclePanelPreset, UserLifecyclePanelProps } from '../core';
import type { ComponentType } from 'react';
import { FlowUserLifecyclePanel } from './flow';
import { ActionsUserLifecyclePanel } from './actions';
import { HistoryUserLifecyclePanel } from './history';

export { FlowUserLifecyclePanel } from './flow';
export { ActionsUserLifecyclePanel } from './actions';
export { HistoryUserLifecyclePanel } from './history';

export const USER_LIFECYCLE_PANEL_PRESETS: Record<UserLifecyclePanelPreset, ComponentType<UserLifecyclePanelProps>> = {
  flow: FlowUserLifecyclePanel,
  actions: ActionsUserLifecyclePanel,
  history: HistoryUserLifecyclePanel,
};
