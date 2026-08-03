'use client';

import { type ReactNode } from 'react';
import { Box, Text, Stack, Flex } from '@/ui/primitives';
import { useNavigationLink } from '@/infrastructure/runtime/adapters/presentation/react/navigation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
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

function NavLinkAnchor({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const NavLink = useNavigationLink();
  if (NavLink) {
    return (
      <NavLink href={href} className={className}>
        {children}
      </NavLink>
    );
  }
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

/** Hook-local `tOr`: catalogue value with an English floor, never a raw key.
 *  Floors that interpolate are pre-composed at the call site (AppShell idiom),
 *  so a missing provider renders the documented English string byte-exact. */
function useActivityTranslation() {
  const i18n = useOptionalTranslation('components');
  const tOr = (key: string, floor: string, params?: Record<string, string | number>): string =>
    i18n?.tOr(key, floor, params) ?? floor;
  return { tOr };
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

function ActivityItem({
  item,
  index,
  isLast,
  timeAgo,
}: {
  item: ActivityProps['items'][0];
  index: number;
  isLast: boolean;
  timeAgo: string;
}) {
  const config = TYPE_CONFIG[item.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  // A data-provided icon wins; the bounded per-type rotation is the fallback.
  const IconComponent = item.icon ?? config.icons[index % config.icons.length];

  return (
    <Box
      className="activity-item-v3"
      data-part="item"
      data-type={item.type}
      style={{
        position: 'relative',
        // Runtime geometry: the trailing item drops its block-end breathing
        // room, so this stays inline as data-driven layout.
        paddingBlockEnd: isLast ? 0 : 12,
      }}
    >
      {!isLast && <Box data-part="connector" />}
      <Box
        data-part="item-icon-box"
        data-type={item.type}
      >
        <IconComponent style={{ width: 10, height: 10 }} />
      </Box>
      <Box
        data-part="item-content"
        data-type={item.type}
      >
        <Flex align="center" justify="between" gap={10}>
          <Stack spacing="none" style={{ flex: 1 }}>
            <Text size="xs" weight="medium" data-part="item-text" style={{ lineHeight: 1.3 }}>
              {item.text}
            </Text>
            <Flex align="center" gap={4}>
              <Box data-part="item-dot" data-type={item.type} />
              {/* Relative display text only; the contract carries no ISO
                  timestamp, so no honest `dateTime` can be stamped yet. */}
              <Box as="time" data-part="item-time">
                {timeAgo}
              </Box>
            </Flex>
          </Stack>
          <ChevronRight data-part="item-chevron" />
        </Flex>
      </Box>
    </Box>
  );
}

export function ActivityTimeline({
  items,
  schedule: _schedule = [],
  viewAllHref,
  viewAllLabel,
}: ActivityProps) {
  const { tOr } = useActivityTranslation();
  const resolvedViewAllLabel = viewAllLabel ?? tOr('activity.viewAll', 'View all');

  return (
    <Box
      className="ds-activity-timeline"
      data-part="root"
    >
      <Flex
        align="center"
        justify="between"
        data-part="header"
      >
        <Flex align="center" gap={10}>
          <Box
            data-part="bell-box"
          >
            <Bell style={{ width: 16, height: 16 }} />
            <Box
              data-part="badge"
            >
              <Text data-part="badge-count" style={{ fontSize: 8, fontWeight: 700 }}>
                {items.length}
              </Text>
            </Box>
          </Box>
          <Stack spacing="none">
            <Text weight="bold" data-part="title">
              {tOr('activity.timelineTitle', 'Activity')}
            </Text>
            <Flex align="center" gap={4}>
              <Box className="live-indicator" data-part="live-dot" />
              <Text size="xs" data-part="live-label">
                {tOr('activity.streaming', 'STREAMING')}
              </Text>
            </Flex>
          </Stack>
        </Flex>
        {viewAllHref ? (
          <NavLinkAnchor href={viewAllHref} className="view-all-anchor">
            <Flex
              align="center"
              gap={4}
              className="view-all-link"
              data-part="view-all-link"
            >
              <Text size="xs" weight="medium" data-part="view-all-label">
                {resolvedViewAllLabel}
              </Text>
              <ExternalLink style={{ width: 12, height: 12 }} />
            </Flex>
          </NavLinkAnchor>
        ) : null}
      </Flex>
      <Box data-part="scroll-area" className="activity-scroll">
        <Stack spacing="none" style={{ position: 'relative' }}>
          {items.map((item: ActivityProps['items'][0], i: number) => (
            <ActivityItem
              key={i}
              item={item}
              index={i}
              isLast={i === items.length - 1}
              timeAgo={tOr('activity.timeAgo', `${item.time} ago`, { time: item.time })}
            />
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
