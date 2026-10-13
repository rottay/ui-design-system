'use client';

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Affix,
  Anchor,
  BackTop,
  Box,
  Breadcrumb,
  Button,
  Flex,
  FloatButton,
  Menu,
  NavLink,
  Pagination,
  Segmented,
  Stack,
  Stepper,
  Tabs,
  Text,
} from '@rottay/design-system';
import { PreviewFrame, SurfaceBlock } from '../frames';

// ---------------------------------------------------------------------------
// Real DS-backed preview components
// ---------------------------------------------------------------------------

function BackTopPreview() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 140;
    }
  }, []);

  return (
    <PreviewFrame height={208} width={304}>
      <Box
        ref={scrollRef}
        style={{
          position: 'relative',
          height: '100%',
          overflow: 'auto',
          padding: 14,
        }}
      >
        <Stack spacing="sm">
          <Text size="sm" weight="semibold">
            Scrollable activity feed
          </Text>
          {Array.from({ length: 8 }).map((_, index) => (
            <SurfaceBlock key={index}>
              <Text size="sm">Activity item {index + 1}</Text>
            </SurfaceBlock>
          ))}
        </Stack>
        <BackTop
          target={() => scrollRef.current ?? window}
          visibilityHeight={32}
          style={{
            position: 'absolute',
            inset: 'auto',
            right: 14,
            bottom: 14,
          }}
        >
          <Text size="xs" weight="semibold">
            Top
          </Text>
        </BackTop>
      </Box>
    </PreviewFrame>
  );
}

function FloatButtonPreview() {
  const [open, setOpen] = useState(true);

  return (
    <PreviewFrame height={208} width={304}>
      <Box style={{ padding: 16 }}>
        <Text size="sm" weight="semibold">
          Floating action cluster
        </Text>
        <Text size="xs" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
          The controls below are the actual DS float button family.
        </Text>
      </Box>
      <FloatButton.Group
        open={open}
        onOpenChange={setOpen}
        trigger="click"
        type="primary"
        icon={<Text size="xs">+</Text>}
        style={{
          position: 'absolute',
          inset: 'auto',
          right: 16,
          bottom: 16,
        }}
      >
        <FloatButton icon={<Text size="xs">E</Text>} tooltip="Edit" />
        <FloatButton icon={<Text size="xs">S</Text>} tooltip="Share" />
      </FloatButton.Group>
    </PreviewFrame>
  );
}

function StepperPreview() {
  const [current, setCurrent] = useState(1);

  return (
    <Stack spacing="sm" style={{ width: 340 }}>
      <Stepper
        items={[
          { title: 'Draft', description: 'Configure workspace' },
          { title: 'Review', description: 'Validate policy' },
          { title: 'Launch', description: 'Go live' },
        ]}
        current={current}
        clickable
        onChange={setCurrent}
      />
      <SurfaceBlock>
        <Text size="sm" weight="semibold">
          Step {current + 1}
        </Text>
        <Text size="xs" style={{ marginTop: 6, color: 'var(--ds-color-text-secondary)' }}>
          Click the real DS stepper to move between stages.
        </Text>
      </SurfaceBlock>
    </Stack>
  );
}

export const NAVIGATION_PREVIEWS: Record<string, ReactNode> = {
  // -- Navigation --
  'affix': (
    <Affix offsetTop={0}>
      <Button variant="default">Affixed button</Button>
    </Affix>
  ),
  'anchor': (
    <Anchor affix={false}>
      <Anchor.Link href="#section-1" title="Section 1" />
      <Anchor.Link href="#section-2" title="Section 2" />
      <Anchor.Link href="#section-3" title="Section 3" />
    </Anchor>
  ),
  'back-top': <BackTopPreview />,
  'breadcrumb': (
    <Breadcrumb
      items={[
        { key: 'home', label: 'Home' },
        { key: 'category', label: 'Category' },
        { key: 'current', label: 'Current' },
      ]}
    />
  ),
  'float-button': <FloatButtonPreview />,
  'link': (
    <Flex gap={12} wrap="wrap" align="center">
      <NavLink href="/primitives" type="primary">
        Tenant overview
      </NavLink>
      <NavLink href="https://rottay.com" external>
        External docs
      </NavLink>
      <NavLink href="/restricted" disabled>
        Disabled state
      </NavLink>
    </Flex>
  ),
  'menu': (
    <Menu
      mode="vertical"
      items={[
        { key: 'home', label: 'Home' },
        { key: 'settings', label: 'Settings' },
        { key: 'profile', label: 'Profile' },
      ]}
      style={{ width: 200 }}
    />
  ),
  'pagination': <Pagination total={100} pageSize={10} current={1} />,
  'segmented': (
    <Segmented
      options={['Daily', 'Weekly', 'Monthly']}
      defaultValue="Weekly"
    />
  ),
  'stepper': <StepperPreview />,
  'tabs': (
    <Tabs
      items={[
        { key: '1', label: 'Tab 1', children: <Text size="sm">Content 1</Text> },
        { key: '2', label: 'Tab 2', children: <Text size="sm">Content 2</Text> },
        { key: '3', label: 'Tab 3', children: <Text size="sm">Content 3</Text> },
      ]}
    />
  ),
};
