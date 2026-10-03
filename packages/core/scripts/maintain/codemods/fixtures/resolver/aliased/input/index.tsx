import { TooltipValue, TONE_TO_TAG_VARIANT } from '@rottay/design-system';
import { Button } from '@rottay/design-system/primitives/button';

export function Chart() {
  return (
    <Button>
      <TooltipValue color={TONE_TO_TAG_VARIANT.success} />
    </Button>
  );
}
