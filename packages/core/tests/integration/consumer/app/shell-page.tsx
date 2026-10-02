/**
 * The application chrome, built only from the guaranteed root barrel.
 *
 * The page stands in for the three apps on the anatomy they style from their
 * own side: `rt-app-shell` on the shell root and `rt-detail-mobile-action-tray`
 * on the record dock are the app's classes, and `shell-overrides.css` is the
 * app stylesheet that reaches the DS anatomy through them. `PatternStepWizard`
 * is the published name of the step wizard; it carries the sticky dock posture.
 */
'use client';

import { ActionDock, AppShell, PatternStepWizard, Text } from '@rottay/design-system';

export const SHELL_APP_CLASS = 'rt-app-shell';
export const DOCK_APP_CLASS = 'rt-detail-mobile-action-tray';

export default function ShellPage() {
  return (
    <AppShell
      className={SHELL_APP_CLASS}
      sidebar={{
        logo: <Text>Acme</Text>,
        nav: <Text>Roles</Text>,
        footer: <Text>Settings</Text>,
      }}
      header={{
        left: <Text>Open roles</Text>,
        center: <Text>Search</Text>,
        right: <Text>Profile</Text>,
      }}
      footer={<Text>Footer</Text>}
    >
      <ActionDock
        className={DOCK_APP_CLASS}
        data-testid="record-dock"
        actions={[
          { key: 'archive', label: 'Archive', priority: 'secondary' },
          { key: 'share', label: 'Share', priority: 'secondary' },
          { key: 'advance', label: 'Advance', priority: 'primary' },
        ]}
      />
      <PatternStepWizard
        actionPosture="sticky-bottom"
        steps={[
          { key: 'details', title: 'Details', content: <Text>Role details</Text> },
          { key: 'review', title: 'Review', content: <Text>Review the role</Text> },
        ]}
      />
    </AppShell>
  );
}
