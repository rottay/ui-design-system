'use client';

import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { BackTop, Box, Button, Input, Stack, Tag, Text } from '@rottay/design-system';

const STATIC_TRIGGER = { position: 'static' } as const;
const noSubscription = () => () => undefined;

function Case({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <Stack spacing="xs" data-testid={id}>
      <Text size="xs" weight="semibold">
        {label}
      </Text>
      {children}
    </Stack>
  );
}

/** Search cases render on the server; BackTop cases after hydration; the lazy-child pair on demand. */
export function AccessibleNamesFixture() {
  const [lazyMounted, setLazyMounted] = useState(false);
  // BackTop reads the scroll offset on its first client render, so it mounts after hydration.
  const hydrated = useSyncExternalStore(noSubscription, () => true, () => false);

  return (
    <Stack spacing="lg" data-testid="an-root" style={{ padding: 24, maxWidth: 560 }}>
      <Case id="an-search-text" label="Search: visible text">
        <Input.Search aria-label="People" searchButtonText="Find users" onSearch={() => undefined} />
      </Case>
      <Case id="an-search-default" label="Search: default icon">
        <Input.Search aria-label="Query" onSearch={() => undefined} />
      </Case>
      <Case id="an-search-symbol" label="Search: symbol only">
        <Input.Search aria-label="Symbol query" searchButtonText="→" onSearch={() => undefined} />
      </Case>
      {hydrated ? (
        <>
          <Case id="an-backtop-text" label="BackTop: visible text">
            <BackTop visibilityHeight={0} style={STATIC_TRIGGER}>
              Go up
            </BackTop>
          </Case>
          <Case id="an-backtop-default" label="BackTop: default glyph">
            <BackTop visibilityHeight={0} style={STATIC_TRIGGER} />
          </Case>
          <Case id="an-backtop-symbol" label="BackTop: symbol only">
            <BackTop visibilityHeight={0} style={STATIC_TRIGGER}>
              ↑
            </BackTop>
          </Case>
        </>
      ) : null}

      <Box data-testid="an-lazy-control">
        <Button onClick={() => setLazyMounted(true)} disabled={lazyMounted}>
          Mount lazy children
        </Button>
      </Box>
      {/* Tag renders nowhere else here, so its engine first resolves inside these buttons. */}
      <Box data-testid="an-lazy-host">
        {lazyMounted ? (
          <Stack spacing="lg">
            <Case id="an-backtop-lazy" label="BackTop: lazy engine child">
              <BackTop visibilityHeight={0} style={STATIC_TRIGGER}>
                <Tag>Top</Tag>
              </BackTop>
            </Case>
            <Case id="an-search-lazy" label="Search: lazy engine child">
              <Input.Search aria-label="Lazy query" searchButtonText={<Tag>Find</Tag>} onSearch={() => undefined} />
            </Case>
          </Stack>
        ) : null}
      </Box>
    </Stack>
  );
}
