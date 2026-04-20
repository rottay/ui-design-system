'use client';

import { Box, Flex, useTokens } from '@rottay/design-system';
import { Sidebar } from '../sidebar';
import { Header } from '../header';

export function ShowroomShell({ children }: { children: React.ReactNode }) {
  const tokens = useTokens();

  return (
    <Flex style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Flex
        direction="column"
        style={{
          flex: 1,
          minWidth: 0,
          background: 'var(--ds-color-neutral-50)',
        }}
      >
        <Header />
        <Box
          style={{
            flex: 1,
            padding: tokens.spacing[7],
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
