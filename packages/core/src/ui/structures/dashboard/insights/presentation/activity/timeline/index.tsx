'use client';

import { type CSSProperties, type ReactNode } from 'react';
import { Box, Text, Stack, Flex } from '@/ui/primitives';
import { useNavigationLink } from '@/infrastructure/runtime/adapters/presentation/react/navigation';
import {
  AlertCircleIcon as AlertCircle,
  BellIcon as Bell,
  BriefcaseIcon as Briefcase,
  CheckIcon as Check,
  ChevronRightIcon as ChevronRight,
  ExternalLinkIcon as ExternalLink,
  FileTextIcon as FileText,
  InfoIcon as Info,
  PlusIcon as Plus,
  RefreshCwIcon as RefreshCw,
  StarIcon as Star,
  UsersIcon as Users,
  ZapIcon as Zap,
} from '../../../../../../../graphics/icons';
import type { ActivityProps, ActivityItem } from '../../../foundation/contracts';

function NavLinkAnchor({ href, style, children }: { href: string; style?: CSSProperties; children: ReactNode }) {
  const NavLink = useNavigationLink();
  if (NavLink) {
    return (
      <NavLink href={href} style={style}>
        {children}
      </NavLink>
    );
  }
  return (
    <a href={href} style={style}>
      {children}
    </a>
  );
}

const SUCCESS_ICONS = [Check, Briefcase, Star, Zap];
const PRIMARY_ICONS = [Plus, FileText, Users, Briefcase];
const INFO_ICONS = [Info, FileText, Briefcase];
const WARNING_ICONS = [AlertCircle, RefreshCw, FileText];
const ERROR_ICONS = [RefreshCw, AlertCircle];

const TYPE_CONFIG = {
  success: {
    icons: SUCCESS_ICONS,
    gradient: 'linear-gradient(135deg, var(--ds-color-success), var(--ds-color-success-200))',
  },
  primary: {
    icons: PRIMARY_ICONS,
    gradient: 'linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-primary-200))',
  },
  info: {
    icons: INFO_ICONS,
    gradient: 'linear-gradient(135deg, var(--ds-color-info), var(--ds-color-info-200))',
  },
  warning: {
    icons: WARNING_ICONS,
    gradient: 'linear-gradient(135deg, var(--ds-color-warning), var(--ds-color-warning-200))',
  },
  error: {
    icons: ERROR_ICONS,
    gradient: 'linear-gradient(135deg, var(--ds-color-error), var(--ds-color-error-200))',
  },
} as const;

function ActivityItem({ item, index, isLast }: { item: ActivityProps['items'][0]; index: number; isLast: boolean }) {
  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const IconComponent = config.icons[index % config.icons.length];

  return (
    <Box
      className="activity-item-v3"
      data-part="item"
      data-type={item.type}
      style={{
        position: 'relative',
        paddingLeft: 30,
        paddingBottom: isLast ? 0 : 12,
      }}
    >
      {!isLast && (
        <Box
          data-part="connector"
          style={{
            position: 'absolute',
            left: 9,
            top: 22,
            bottom: 0,
            width: 2,
          }}
        />
      )}
      <Box
        data-part="item-icon-box"
        data-type={item.type}
        style={{
          position: 'absolute',
          left: 0,
          top: 2,
          width: 20,
          height: 20,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
        }}
      >
        <IconComponent style={{ width: 10, height: 10 }} />
      </Box>
      <Box
        data-part="item-content"
        data-type={item.type}
        style={{
          padding: '10px 14px',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
        }}
      >
        <Flex align="center" justify="between" gap={10}>
          <Stack spacing="none" style={{ flex: 1 }}>
            <Text size="xs" weight="medium" data-part="item-text" style={{ lineHeight: 1.3 }}>
              {item.text}
            </Text>
            <Flex align="center" gap={4}>
              <Box data-part="item-dot" data-type={item.type} style={{ width: 4, height: 4 }} />
              <Text size="xs" data-part="item-time" style={{ fontFamily: 'monospace', fontSize: 9 }}>
                {item.time} ago
              </Text>
            </Flex>
          </Stack>
          <ChevronRight style={{ width: 12, height: 12, transition: 'all 0.3s ease' }} />
        </Flex>
      </Box>
    </Box>
  );
}

export function ActivityTimeline({
  items,
  schedule: _schedule = [],
  viewAllHref,
  viewAllLabel = 'View all',
}: ActivityProps) {
  return (
    <Box
      className="ds-activity-timeline"
      data-part="root"
      style={{
        height: 415,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Flex
        align="center"
        justify="between"
        data-part="header"
        style={{ paddingBottom: 12, marginBottom: 12, position: 'relative' }}
      >
        <Flex align="center" gap={10}>
          <Box
            data-part="bell-box"
            style={{
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Bell style={{ width: 16, height: 16 }} />
            <Box
              data-part="badge"
              style={{
                position: 'absolute',
                top: -4,
                right: -4,
                width: 14,
                height: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text data-part="badge-count" style={{ fontSize: 8, fontWeight: 700 }}>
                {items.length}
              </Text>
            </Box>
          </Box>
          <Stack spacing="none">
            <Text weight="bold" data-part="title">
              Activity
            </Text>
            <Flex align="center" gap={4}>
              <Box className="live-indicator" data-part="live-dot" style={{ width: 6, height: 6 }} />
              <Text size="xs" data-part="live-label" style={{ fontFamily: 'monospace', fontSize: 9 }}>
                STREAMING
              </Text>
            </Flex>
          </Stack>
        </Flex>
        {viewAllHref ? (
          <NavLinkAnchor href={viewAllHref} style={{ textDecoration: 'none' }}>
            <Flex
              align="center"
              gap={4}
              className="view-all-link"
              data-part="view-all-link"
              style={{ padding: '6px 10px', transition: 'all 0.2s ease' }}
            >
              <Text size="xs" weight="medium" data-part="view-all-label">
                {viewAllLabel}
              </Text>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </Flex>
          </NavLinkAnchor>
        ) : null}
      </Flex>
      <Box data-part="scroll-area" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="activity-scroll">
        <Stack spacing="none" style={{ position: 'relative' }}>
          {items.map((item: ActivityProps['items'][0], i: number) => (
            <ActivityItem key={i} item={item} index={i} isLast={i === items.length - 1} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
