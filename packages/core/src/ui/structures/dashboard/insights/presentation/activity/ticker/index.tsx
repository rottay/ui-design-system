'use client';

import { useState, useEffect, useCallback, type FocusEvent, type ReactNode } from 'react';
import { Box, Text, Stack, Flex } from '@/ui/primitives';
import { useNavigationLink } from '@/infrastructure/runtime/adapters/presentation/react/navigation';
import { useOptionalTranslation } from '@/infrastructure/runtime/i18n';
import { useReducedMotion } from '@/graphics/motion/react/runtime';
import {
  AlertCircleIcon as AlertCircle,
  BellIcon as Bell,
  BriefcaseIcon as Briefcase,
  CheckIcon as Check,
  ChevronLeftIcon as ChevronLeft,
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

const ROTATION_INTERVAL = 5000;
const SLIDE_OUT_MS = 300;

export function ActivityTicker({
  items,
  schedule: _schedule = [],
  viewAllHref,
  viewAllLabel,
}: ActivityProps) {
  const { tOr } = useActivityTranslation();
  const prefersReducedMotion = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  // Motion law: auto-rotation pauses while the reader hovers the ticker or
  // holds keyboard focus inside it, and never runs under reduced motion.
  const [isPaused, setIsPaused] = useState(false);

  const advance = useCallback(
    (step: 1 | -1) => {
      if (items.length <= 1) return;
      setDirection(step === 1 ? 'next' : 'prev');
      // Reduced motion: the item swaps instantly, no slide cadence.
      if (prefersReducedMotion) {
        setCurrentIndex((prev) => (prev + step + items.length) % items.length);
        return;
      }
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + step + items.length) % items.length);
        setIsAnimating(false);
      }, SLIDE_OUT_MS);
    },
    [items.length, prefersReducedMotion],
  );

  const goToNext = useCallback(() => advance(1), [advance]);
  const goToPrev = useCallback(() => advance(-1), [advance]);

  const goToIndex = useCallback(
    (target: number) => {
      if (items.length <= 1 || target === currentIndex) return;
      setDirection(target > currentIndex ? 'next' : 'prev');
      if (prefersReducedMotion) {
        setCurrentIndex(target);
        return;
      }
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex(target);
        setIsAnimating(false);
      }, SLIDE_OUT_MS);
    },
    [items.length, currentIndex, prefersReducedMotion],
  );

  useEffect(() => {
    if (items.length <= 1 || isPaused || prefersReducedMotion) return;
    const interval = setInterval(goToNext, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [items.length, goToNext, isPaused, prefersReducedMotion]);

  const handleBlurCapture = useCallback((event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsPaused(false);
    }
  }, []);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const config = TYPE_CONFIG[currentItem.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  // A data-provided icon wins; the bounded per-type rotation is the fallback.
  const IconComponent = currentItem.icon ?? config.icons[currentIndex % config.icons.length];
  const resolvedViewAllLabel = viewAllLabel ?? tOr('activity.viewAll', 'View all');

  return (
    <Box
      className="ds-activity-ticker"
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
              {tOr('activity.tickerTitle', 'Live Updates')}
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
              <ExternalLink style={{ width: 10, height: 10 }} />
            </Flex>
          </NavLinkAnchor>
        ) : null}
      </Flex>

      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          className="ticker-container"
          data-part="ticker-body"
          data-paused={isPaused}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={handleBlurCapture}
        >
          <Box
            className={
              'ticker-content-v3 ' +
              (isAnimating ? (direction === 'next' ? 'ticker-out-left' : 'ticker-out-right') : 'ticker-in')
            }
            data-part="ticker-content"
          >
            <Flex align="center" justify="center" data-part="item-presenter">
              <Box
                data-part="item-icon-box"
                data-type={currentItem.type}
                style={{
                  position: 'relative',
                }}
              >
                <IconComponent style={{ width: 24, height: 24 }} />
              </Box>
            </Flex>
            <Text
              size="sm"
              weight="semibold"
              data-part="item-text"
            >
              {currentItem.text}
            </Text>
            <Flex align="center" justify="center" gap={8}>
              <Box data-part="item-type-dot" data-type={currentItem.type} />
              {/* Relative display text only; the contract carries no ISO
                  timestamp, so no honest `dateTime` can be stamped yet. */}
              <Box as="time" data-part="item-time">
                {tOr('activity.timeAgo', `${currentItem.time} ago`, { time: currentItem.time })}
              </Box>
            </Flex>
          </Box>

          {items.length > 1 && (
            <Flex align="center" justify="center" gap={16} data-part="controls">
              <Box
                as="button"
                {...({ type: 'button' } as any)}
                onClick={goToPrev}
                className="nav-button"
                data-part="nav-button"
                aria-label={tOr('activity.tickerPrevious', 'Previous update')}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </Box>
              <Flex align="center" gap={8}>
                {items.map((item: ActivityItem, i: number) => (
                  <Box
                    as="button"
                    {...({ type: 'button' } as any)}
                    key={i}
                    onClick={() => goToIndex(i)}
                    className="ticker-dot"
                    data-part="ticker-dot"
                    data-active={i === currentIndex}
                    data-type={item.type}
                    aria-label={tOr('activity.tickerGoTo', `Go to update ${i + 1}`, { index: i + 1 })}
                    aria-current={i === currentIndex ? 'true' : undefined}
                    style={{
                      // Runtime state geometry (the active dot stretches): the
                      // width is state-driven, so it stays inline by design.
                      width: i === currentIndex ? 24 : 10,
                      position: 'relative',
                    }}
                  />
                ))}
              </Flex>
              <Text size="xs" data-part="ticker-counter">
                {currentIndex + 1}/{items.length}
              </Text>
              <Box
                as="button"
                {...({ type: 'button' } as any)}
                onClick={goToNext}
                className="nav-button"
                data-part="nav-button"
                aria-label={tOr('activity.tickerNext', 'Next update')}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </Box>
            </Flex>
          )}

          {/* Rotation progress: only meaningful while the rotation actually
              runs — never rendered under reduced motion. */}
          {items.length > 1 && !prefersReducedMotion && (
            <Box
              data-part="progress-track"
            >
              <Box
                className="ticker-progress"
                data-part="progress-fill"
                data-type={currentItem.type}
                key={currentIndex}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
