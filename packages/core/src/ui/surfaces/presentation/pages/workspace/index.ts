/**
 * @fileoverview workspace pages group barrel.
 * Workspace surfaces: collection workspace, record workbench, command center, decision inbox.
 */

export * from './collection-workspace';
export * from './record-workbench';
// Named exports for command-center to avoid collision with structures'
// StatItem and ActivityItem (which have the same identifier names but
// are structurally different types).
export { CommandCenterSurface } from './command-center';
export type {
  CommandCenterSurfaceProps,
  QuickAction,
  CommandSection,
  InsightItem,
  StatItem as CommandStatItem,
  ActivityItem as CommandActivityItem,
} from './command-center';
export * from './decision-inbox';
