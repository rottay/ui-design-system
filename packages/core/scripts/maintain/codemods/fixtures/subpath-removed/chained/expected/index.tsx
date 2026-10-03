import { Tag, TONE_TO_VARIANT } from '@rottay/design-system';
import { Icon, PlusIcon } from '@rottay/design-system/icons/full';

export function Chip({ tone }: { tone: keyof typeof TONE_TO_VARIANT }) {
  return (
    <Tag tone={tone}>
      <PlusIcon />
      <Icon name="action.add" decorative />
      {TONE_TO_VARIANT[tone]}
    </Tag>
  );
}
