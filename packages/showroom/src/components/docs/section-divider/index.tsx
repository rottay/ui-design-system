import { Box } from '@rottay/design-system';

import { DOCS_DIVIDER, type DocsBaseProps } from '../tone';

export function SectionDivider({ style, ...props }: DocsBaseProps) {
  return (
    <Box
      {...props}
      aria-hidden="true"
      style={{ height: 1, width: '100%', borderRadius: 999, background: DOCS_DIVIDER, ...style }}
    />
  );
}
