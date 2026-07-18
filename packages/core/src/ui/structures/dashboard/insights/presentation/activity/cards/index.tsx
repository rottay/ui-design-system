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

function ActivityCard({ item, index }: { item: ActivityProps['items'][0]; index: number }) {
  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const IconComponent = config.icons[index % config.icons.length];

  return (
    <Box
      className="activity-card-item-v3"
      data-part="item"
      data-type={item.type}
      style={{
        position: 'relative',
        padding: '8px 12px',
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
            weight="medium"
            data-part="item-text"
            style={{
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.text}
          </Text>
          <Flex align="center" gap={4}>
            <Box className="time-dot" data-part="item-dot" data-type={item.type} style={{ width: 4, height: 4 }} />
            <Text size="xs" data-part="item-time" style={{ fontFamily: 'monospace', fontSize: 9 }}>
              {item.time} ago
            </Text>
          </Flex>
        </Stack>
        <ChevronRight
          style={{
            width: 12,
            height: 12,
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        />
      </Flex>
    </Box>
  );
}

export function ActivityCards({
  items,
  schedule: _schedule = [],
  viewAllHref,
  viewAllLabel = 'View all',
}: ActivityProps) {
  return (
    <Box
      className="ds-activity-cards"
      data-part="root"
      style={{
        height: 415,
        padding: '16px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Flex
        align="center"
        justify="between"
        data-part="header"
        style={{ paddingBottom: 12, marginBottom: 12, position: 'relative' }}
      >
        <Flex align="center" gap={8}>
          <Box
            data-part="bell-box"
            style={{
              width: 28,
              height: 28,
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
                top: -3,
                right: -3,
                width: 12,
                height: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text data-part="badge-count" style={{ fontSize: 7, fontWeight: 700 }}>
                {items.length}
              </Text>
            </Box>
          </Box>
          <Text weight="bold" size="sm" data-part="title">
            Activity
          </Text>
        </Flex>
        {viewAllHref ? (
          <NavLinkAnchor href={viewAllHref} style={{ textDecoration: 'none' }}>
            <Flex
              align="center"
              gap={3}
              className="view-all-link"
              data-part="view-all-link"
              style={{ padding: '4px 8px', transition: 'all 0.2s ease' }}
            >
              <Text size="xs" weight="medium" data-part="view-all-label" style={{ fontSize: 10 }}>
                {viewAllLabel}
              </Text>
              <ExternalLink style={{ width: 9, height: 9 }} />
            </Flex>
          </NavLinkAnchor>
        ) : null}
      </Flex>
      <Box data-part="scroll-area" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }} className="activity-scroll">
        <Stack spacing="sm">
          {items.map((item: ActivityItem, i: number) => (
            <ActivityCard key={i} item={item} index={i} />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
