import { Button, type ButtonProps } from '@rottay/design-system/primitives/button';
import { Tabs } from "@rottay/design-system/primitives/tabs";
import '@rottay/design-system/styles';
import '@rottay/design-system/styles/default';
import '@rottay/design-system/styles/platform';
import { Icon, getIconCorpusEntry } from '@rottay/design-system/icons/corpus';
import { BitHireIconPreset } from '@rottay/design-system/icons/bithire';
import { Icon as RoleIcon } from '@rottay/design-system/icons';
import { ActionAddIcon } from '@rottay/design-system/icons/roles/action-add';

export { useTheme } from '@rottay/design-system/runtime/provider';

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
