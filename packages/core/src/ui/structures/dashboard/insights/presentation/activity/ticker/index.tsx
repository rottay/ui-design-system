'use client';

import { useState, useEffect, useCallback, type CSSProperties, type ReactNode } from 'react';
import { Box, Text, Stack, Flex } from '@/ui/primitives';
import { useNavigationLink } from '@/infrastructure/runtime/adapters/presentation/react/navigation';
import {
  Bell,
  Check,
  Plus,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Briefcase,
  FileText,
  Users,
  Star,
  Zap,
  RefreshCw,
} from 'lucide-react';
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

const ROTATION_INTERVAL = 5000;

export function ActivityTicker({
  items,
  schedule: _schedule = [],
  viewAllHref,
  viewAllLabel = 'View all',
}: ActivityProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const goToNext = useCallback(() => {
    if (items.length <= 1) return;
    setDirection('next');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setIsAnimating(false);
    }, 300);
  }, [items.length]);

  const goToPrev = useCallback(() => {
    if (items.length <= 1) return;
    setDirection('prev');
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setIsAnimating(false);
    }, 300);
  }, [items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(goToNext, ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, [items.length, goToNext]);

  if (items.length === 0) return null;

  const currentItem = items[currentIndex];
  const config = TYPE_CONFIG[currentItem.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.info;
  const IconComponent = config.icons[currentIndex % config.icons.length];

  return (
    <Box
      className="ds-activity-ticker"
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
              Live Updates
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
              <ExternalLink style={{ width: 10, height: 10 }} />
            </Flex>
          </NavLinkAnchor>
        ) : null}
      </Flex>

      <Box style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box
          className="ticker-container"
          data-part="ticker-body"
          style={{
            flex: 1,
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            className={
              'ticker-content-v3 ' +
              (isAnimating ? (direction === 'next' ? 'ticker-out-left' : 'ticker-out-right') : 'ticker-in')
            }
            style={{ textAlign: 'center' }}
          >
            <Flex align="center" justify="center" style={{ marginBottom: 16 }}>
              <Box
                data-part="item-icon-box"
                data-type={currentItem.type}
                style={{
                  width: 52,
                  height: 52,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
              style={{ marginBottom: 10, lineHeight: 1.6, fontSize: 15 }}
            >
              {currentItem.text}
            </Text>
            <Flex align="center" justify="center" gap={8}>
              <Box data-part="item-type-dot" data-type={currentItem.type} style={{ width: 6, height: 6 }} />
              <Text size="xs" data-part="item-time" style={{ fontFamily: 'monospace', fontSize: 11 }}>
                {currentItem.time} ago
              </Text>
            </Flex>
          </Box>

          {items.length > 1 && (
            <Flex align="center" justify="center" gap={16} style={{ marginTop: 24 }}>
              <Box
                onClick={goToPrev}
                className="nav-button"
                data-part="nav-button"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <ChevronLeft style={{ width: 16, height: 16 }} />
              </Box>
              <Flex align="center" gap={8}>
                {items.map((item: ActivityItem, i: number) => (
                  <Box
                    key={i}
                    onClick={() => {
                      if (i !== currentIndex) {
                        setDirection(i > currentIndex ? 'next' : 'prev');
                        setIsAnimating(true);
                        setTimeout(() => {
                          setCurrentIndex(i);
                          setIsAnimating(false);
                        }, 300);
                      }
                    }}
                    className="ticker-dot"
                    data-part="ticker-dot"
                    data-active={i === currentIndex}
                    data-type={item.type}
                    style={{
                      width: i === currentIndex ? 24 : 10,
                      height: 10,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                    }}
                  />
                ))}
              </Flex>
              <Text size="xs" data-part="ticker-counter" style={{ fontFamily: 'monospace', fontSize: 10 }}>
                {currentIndex + 1}/{items.length}
              </Text>
              <Box
                onClick={goToNext}
                className="nav-button"
                data-part="nav-button"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <ChevronRight style={{ width: 16, height: 16 }} />
              </Box>
            </Flex>
          )}

          {items.length > 1 && (
            <Box
              data-part="progress-track"
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 3,
                overflow: 'hidden',
              }}
            >
              <Box
                className="ticker-progress"
                data-part="progress-fill"
                data-type={currentItem.type}
                key={currentIndex}
                style={{ height: '100%' }}
              />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
