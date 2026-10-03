import { Button, type ButtonProps } from '@rottay/design-system';
import { Tabs } from "@rottay/design-system";
import '@rottay/design-system/styles.css';
import '@rottay/design-system/styles/rottay';
import '@rottay/design-system/styles/rottay';
import { Icon, getIconCorpusEntry } from '@rottay/design-system/icons';
import { BitHireIconPreset } from '@rottay/design-system/icons/presets/bithire';
import { Icon as RoleIcon } from '@rottay/design-system/icons';
import { ActionAddIcon } from '@rottay/design-system/icons/roles/action-add';

export { useTheme } from '@rottay/design-system';

export function Screen(props: ButtonProps) {
  return (
    <Tabs>
      <Button {...props} />
      <Icon name="action.add" decorative />
      <RoleIcon name="action.add" decorative />
      <BitHireIconPreset />
      <ActionAddIcon />
      {String(getIconCorpusEntry)}
    </Tabs>
  );
}
