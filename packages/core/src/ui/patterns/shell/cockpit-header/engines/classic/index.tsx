'use client';

/**
 * @fileoverview Classic engine for the CockpitHeader pattern.
 * Renders a rich header for detail/workbench pages with back button,
 * breadcrumbs, title + status badges, and action buttons.
 * Supports sticky compact mode on scroll.
 */

import React, { useState, useEffect, useRef } from 'react';
import { Box, Flex } from '../../../../../primitives/layout';
import { Text, Tag } from '../../../../../primitives/display';
import type { CockpitHeaderProps, CockpitStatus } from '../../contracts';

/** Maps status variant to Tag color name for Ant Design. */
const STATUS_VARIANT_COLORS: Record<CockpitStatus['variant'], string> = {
  success: 'green',
  warning: 'orange',
  error: 'red',
  info: 'blue',
  default: 'default',
};

/** Back arrow icon as inline SVG. */
function BackArrowIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

/**
 * Classic engine CockpitHeader.
 * Renders a full header card with breadcrumb trail, title row with status
 * badges, action buttons, and optional sticky compact mode.
 */
export default function ClassicCockpitHeader(props: CockpitHeaderProps) {
  const {
    title,
    subtitle,
    breadcrumbs,
    status,
    actions,
    sticky = false,
    onBack,
    loading,
    className,
    style,
  } = props;

  const [isCompact, setIsCompact] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sticky) return;

    const handleScroll = () => {
      setIsCompact(window.scrollY > 60);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sticky]);

  if (loading) {
    return (
      <Box
        className={className}
        style={{
          padding: '20px 24px',
          background: 'var(--ds-color-bg-primary)',
          borderRadius: 12,
          border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
          ...style,
        }}
      >
        <Flex direction="column" gap={12}>
          <Box style={{ width: 160, height: 12, borderRadius: 4, background: 'var(--ds-color-bg-secondary)' }} />
          <Box style={{ width: 260, height: 28, borderRadius: 4, background: 'var(--ds-color-bg-secondary)' }} />
          <Box style={{ width: 180, height: 14, borderRadius: 4, background: 'var(--ds-color-bg-secondary)' }} />
        </Flex>
      </Box>
    );
  }

  const stickyStyle = sticky
    ? {
        position: 'sticky' as const,
        top: 0,
        zIndex: 100,
        transition: 'padding 200ms ease, box-shadow 200ms ease',
        ...(isCompact
          ? {
              padding: '12px 24px',
              boxShadow: '0 2px 8px color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)',
            }
          : {}),
      }
    : {};

  return (
    <Box
      ref={headerRef}
      className={`ds-pattern-cockpit-header ds-engine-classic ${className ?? ''}`}
      style={{
        padding: '20px 24px',
        background: 'var(--ds-color-bg-primary)',
        borderRadius: 12,
        border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
        ...stickyStyle,
        ...style,
      }}
    >
      {/* Breadcrumbs row */}
      {breadcrumbs && breadcrumbs.length > 0 && !isCompact && (
        <Flex align="center" gap={6} style={{ marginBottom: 12 }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={`crumb-${idx}`}>
              {idx > 0 && (
                <Text style={{ fontSize: 12, color: 'var(--ds-color-text-muted)' }}>/</Text>
              )}
              {crumb.href ? (
                <a
                  href={crumb.href}
                  style={{
                    fontSize: 12,
                    color: 'var(--ds-color-primary)',
                    cursor: 'pointer',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {crumb.label}
                </a>
              ) : (
                <Text
                  style={{
                    fontSize: 12,
                    color: 'var(--ds-color-text-muted)',
                    fontWeight: 500,
                  }}
                >
                  {crumb.label}
                </Text>
              )}
            </React.Fragment>
          ))}
        </Flex>
      )}

      {/* Main row: back + title + status | actions */}
      <Flex justify="between" align="center">
        <Flex align="center" gap={12}>
          {onBack && (
            <Box
              onClick={onBack}
              style={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 8,
                color: 'var(--ds-color-text-secondary)',
                transition: 'background 150ms ease',
              }}
            >
              <BackArrowIcon />
            </Box>
          )}
          <Flex direction="column" gap={2}>
            <Flex align="center" gap={8}>
              <Text
                style={{
                  fontSize: isCompact ? 16 : 22,
                  fontWeight: 700,
                  color: 'var(--ds-color-text-primary)',
                  lineHeight: 1.3,
                  transition: 'font-size 200ms ease',
                }}
              >
                {title}
              </Text>
              {status && status.length > 0 && (
                <Flex gap={6} align="center">
                  {status.map((s, idx) => (
                    <Tag
                      key={`status-${idx}`}
                      color={STATUS_VARIANT_COLORS[s.variant]}
                    >
                      {s.label}
                    </Tag>
                  ))}
                </Flex>
              )}
            </Flex>
            {subtitle && !isCompact && (
              <Text
                style={{
                  fontSize: 14,
                  color: 'var(--ds-color-text-muted)',
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Text>
            )}
          </Flex>
        </Flex>

        {/* Actions */}
        {actions && (
          <Flex gap={8} align="center">
            {actions}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
