import { Icon, PlusIcon, XIcon as CloseGlyph } from '@rottay/design-system/icons';
import * as Icons from '@rottay/design-system/icons';

export function Toolbar() {
  return (
    <>
      <PlusIcon size={16} />
      <CloseGlyph />
      <Icons.ZapIcon />
      <Icon name="action.add" decorative />
    </>
  );
}
