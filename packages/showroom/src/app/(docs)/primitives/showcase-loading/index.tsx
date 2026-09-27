import { Box, Stack, Text } from '@rottay/design-system';

import { DocsFrame } from '@/components/docs/frame';
import {
  SHOWROOM_SURFACES,
  mixWithCanvas,
} from '@/components/playground/tokens/surfaces';

export function ShowcaseLoading() {
  return (
    <DocsFrame
      style={{
        padding: 18,
        border: `1px solid ${SHOWROOM_SURFACES.border}`,
        background: `linear-gradient(180deg, ${SHOWROOM_SURFACES.subtle} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
      }}
    >
      <Stack spacing="sm" fullWidth>
        <Text
          as="div"
          color="inherit"
          wrap="auto"
          style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'inherit' }}
        >
          Preparing live DS runtime
        </Text>
        <Text
          as="div"
          color="inherit"
          wrap="auto"
          style={{
            fontSize: '0.75rem',
            fontWeight: 'inherit',
            textAlign: 'inherit',
            color: 'var(--ds-color-text-secondary)',
          }}
        >
          The provider-backed component shelf loads after the route shell so the page stays responsive.
        </Text>
        <Box
          style={{
            width: '100%',
            height: 144,
            borderRadius: 18,
            background: `linear-gradient(180deg, ${mixWithCanvas(
              'var(--ds-color-primary, #60a5fa)',
              6,
            )} 0%, ${SHOWROOM_SURFACES.surface} 100%)`,
          }}
        />
      </Stack>
    </DocsFrame>
  );
}
