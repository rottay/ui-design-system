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
  success: { icons: SUCCESS_ICONS },
  primary: { icons: PRIMARY_ICONS },
  info: { icons: INFO_ICONS },
  warning: { icons: WARNING_ICONS },
  error: { icons: ERROR_ICONS },
} as const;

function CompactItem({ item, index }: { item: ActivityProps['items'][0]; index: number }) {
  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const IconComponent = config.icons[index % config.icons.length];

  return (
    <Box
      className="activity-compact-item-v3"
      data-part="item"
      data-type={item.type}
      style={{
        padding: '10px 14px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
      }}
    >
      <Flex align="center" gap={12} data-part="item-row" style={{ position: 'relative' }}>
        <Box
          data-part="item-icon-box"
          data-type={item.type}
          style={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            position: 'relative',
            transition: 'transform 0.3s ease',
          }}
        >
          <IconComponent style={{ width: 12, height: 12 }} />
        </Box>
        <Stack spacing="none" style={{ flex: 1, minWidth: 0 }}>
          <Text
            size="xs"
            data-part="item-text"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 500,
            }}
          >
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
  );
}

export function ActivityCompact({
  items,
  schedule: _schedule = [],
  viewAllHref,
  viewAllLabel = 'View all',
}: ActivityProps) {
  return (
    <Box
      className="ds-activity-compact"
      data-part="root"
      style={{
        height: 415,
        padding: '16px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
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
            <Bell style={{ width: 14, height: 14 }} />
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
              Recent Activity
            </Text>
            <Text size="xs" data-part="update-count" style={{ fontFamily: 'monospace', fontSize: 9 }}>
              {items.length} UPDATES
            </Text>
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
              <ExternalLink style={{ width: 10, height: 10 }} />
            </Flex>
          </NavLinkAnchor>
        ) : null}
      </Flex>
      <Box data-part="scroll-area" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="activity-scroll">
        <Stack spacing="sm">
          {items.map((item: ActivityItem, i: number) => (
            <CompactItem key={i} item={item} index={i} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
