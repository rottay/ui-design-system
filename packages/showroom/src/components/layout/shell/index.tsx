'use client';

import { useState, useCallback, useEffect } from 'react';
import { Box, Flex, useTokens } from '@rottay/design-system';
import { Sidebar } from '../sidebar';
import { Header } from '../header';
import { SearchOverlay } from '../search';
import { StateToast } from '../state-toast';

export function ShowroomShell({ children }: { children: React.ReactNode }) {
  const tokens = useTokens();
  const [searchOpen, setSearchOpen] = useState(false);

  const openSearch = useCallback(() => setSearchOpen(true), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Global Cmd+K / Ctrl+K handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
        <Header onSearchOpen={openSearch} />
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
      <SearchOverlay isOpen={searchOpen} onClose={closeSearch} />
      <StateToast />
    </Flex>
  );
}
