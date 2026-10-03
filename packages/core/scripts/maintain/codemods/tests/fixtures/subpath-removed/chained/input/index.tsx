import { Tag, TONE_TO_TAG_VARIANT } from '@rottay/design-system/primitives/tag';
import { Icon, PlusIcon } from '@rottay/design-system/icons/full';

export function Chip({ tone }: { tone: keyof typeof TONE_TO_TAG_VARIANT }) {
  return (
    <Tag tone={tone}>
      <PlusIcon />
      <Icon name="action.add" decorative />
      {TONE_TO_TAG_VARIANT[tone]}
    </Tag>
  );
}
