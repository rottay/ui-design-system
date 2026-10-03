import { PlusIcon } from 'lucide-react';
import { XIcon } from './icons';

// PlusIcon from '@rottay/design-system/icons' would be reported; these are not that.
export function Toolbar() {
  return (
    <>
      <PlusIcon />
      <XIcon />
    </>
  );
}
