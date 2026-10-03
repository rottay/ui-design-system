import { Button } from '@rottay/design-system-extras/primitives/button';
import { Tabs } from '@other/design-system/primitives/tabs';
import { Local } from './primitives/button';

// import { Button } from '@rottay/design-system/primitives/button';
export const note = "import '@rottay/design-system/styles'";

export function Screen() {
  return (
    <Tabs>
      <Button />
      <Local />
    </Tabs>
  );
}
