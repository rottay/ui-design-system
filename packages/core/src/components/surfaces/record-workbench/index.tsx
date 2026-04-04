/**
 * @fileoverview RecordWorkbenchSurface - entity detail page with tabs and actions.
 *
 * Enhanced DetailSurface with: tab management, related records, action toolbar,
 * history/audit trail, sidebar metadata.
 *
 * For: user detail, candidate profile, event detail, order detail, etc.
 */

import React, { useState, useCallback, useId } from 'react';
import type { ReactNode } from 'react';
import { Box } from '../../primitives/layout/Box';
import { Stack } from '../../primitives/layout/Stack';
import { Flex } from '../../primitives/layout/Flex';
import { Text } from '../../primitives/display/Typography';
import { Button } from '../../primitives/inputs/Button';
import { Skeleton } from '../../primitives/feedback/Skeleton';
import { Spinner } from '../../primitives/feedback/Spinner';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecordTab {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  render: () => ReactNode;
}

export interface RecordAction {
  key: string;
  label: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'default';
  onClick: () => void;
  disabled?: boolean;
}

export interface MetadataField {
  key: string;
  label: string;
  value: ReactNode;
}

export interface RecordWorkbenchSurfaceProps {
  /** Record title (entity name, user name, etc.). */
  title: string;
  /** Subtitle or description. */
  subtitle?: string;
  /** Status badge. */
  status?: { label: string; variant?: 'success' | 'warning' | 'error' | 'info' | 'default' };
  /** Avatar or icon for the record. */
  avatar?: ReactNode;

  /** Tabs for the record detail sections. */
  tabs: RecordTab[];
  /** Default active tab key. */
  defaultTab?: string;
  /** Controlled active tab. */
  activeTab?: string;
  /** Tab change handler. */
  onTabChange?: (tabKey: string) => void;

  /** Action buttons (edit, delete, archive, etc.). */
  actions?: RecordAction[];

  /** Sidebar metadata fields. */
  metadata?: MetadataField[];
  /** Sidebar width. */
  sidebarWidth?: string;
  /** Hide sidebar. */
  hideSidebar?: boolean;

  /** Related records section (shown below tabs). */
  relatedRecords?: ReactNode;

  /** Breadcrumbs slot. */
  breadcrumbs?: ReactNode;
  /** Header slot (above title). */
  headerSlot?: ReactNode;
  /** Footer slot. */
  footerSlot?: ReactNode;

  /** Loading state. */
  loading?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function RecordWorkbenchSurface(props: RecordWorkbenchSurfaceProps) {
  const {
    title,
    subtitle,
    status,
    avatar,
    tabs,
    defaultTab,
    activeTab: controlledTab,
    onTabChange,
    actions,
    metadata,
    sidebarWidth = '280px',
    hideSidebar,
    relatedRecords,
    breadcrumbs,
    headerSlot,
    footerSlot,
    loading,
  } = props;

  const instanceId = useId();
  const tabId = (key: string) => `${instanceId}-tab-${key}`;
  const panelId = (key: string) => `${instanceId}-panel-${key}`;

  const [internalTab, setInternalTab] = useState(defaultTab ?? tabs[0]?.key ?? '');
  const activeTab = controlledTab ?? internalTab;

  const handleTabChange = useCallback(
    (key: string) => {
      setInternalTab(key);
      onTabChange?.(key);
    },
    [onTabChange],
  );

  const activeTabContent = tabs.find((t) => t.key === activeTab);
  const showSidebar = !hideSidebar && metadata && metadata.length > 0;

  const statusColors: Record<string, string> = {
    success: 'var(--ds-color-success)',
    warning: 'var(--ds-color-warning)',
    error: 'var(--ds-color-error)',
    info: 'var(--ds-color-info)',
    default: 'var(--ds-color-text-muted)',
  };

  return (
    <Stack spacing="md">
      {headerSlot}
      {breadcrumbs}

      {/* Record header */}
      <Flex align="center" gap={4}>
        {loading ? (
          <Flex align="center" gap={4} style={{ flex: 1 }}>
            {avatar && <Skeleton variant="circular" width={40} height={40} />}
            <Box style={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={24} />
              {subtitle && <Skeleton variant="text" width="25%" height={16} style={{ marginTop: '6px' }} />}
            </Box>
          </Flex>
        ) : (
          <>
            {avatar && <Box>{avatar}</Box>}
            <Box style={{ flex: 1 }}>
              <Flex align="center" gap={2}>
                <Text size="xl" weight="semibold">{title}</Text>
                {status && (
                  <span
                    style={{
                      padding: '2px 10px',
                      borderRadius: 'var(--ds-radius-full, 9999px)',
                      border: `1px solid ${statusColors[status.variant ?? 'default']}`,
                      color: statusColors[status.variant ?? 'default'],
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {status.label}
                  </span>
                )}
              </Flex>
              {subtitle && <Text size="sm" color="muted">{subtitle}</Text>}
            </Box>
          </>
        )}

        {/* Action buttons */}
        {actions && actions.length > 0 && (
          <Flex gap={2}>
            {actions.map((action) => (
              <Button
                key={action.key}
                variant={
                  action.variant === 'primary'
                    ? 'primary'
                    : action.variant === 'danger'
                      ? 'danger'
                      : 'secondary'
                }
                onClick={action.onClick}
                disabled={action.disabled || loading}
                icon={action.icon}
              >
                {action.label}
              </Button>
            ))}
          </Flex>
        )}
      </Flex>

      {/* Tab bar */}
      <div
        role="tablist"
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid var(--ds-color-border-primary)',
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              key={tab.key}
              id={tabId(tab.key)}
              role="tab"
              aria-selected={isActive}
              aria-controls={panelId(tab.key)}
              tabIndex={isActive ? 0 : -1}
              variant="ghost"
              onClick={() => handleTabChange(tab.key)}
              icon={tab.icon}
              style={{
                borderRadius: 0,
                borderBottom: isActive
                  ? '2px solid var(--ds-color-primary)'
                  : '2px solid transparent',
                color: isActive
                  ? 'var(--ds-color-text-primary)'
                  : 'var(--ds-color-text-muted)',
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '1px 6px',
                    borderRadius: 'var(--ds-radius-full, 9999px)',
                    background: 'var(--ds-color-bg-tertiary)',
                    fontSize: '11px',
                    color: 'var(--ds-color-text-muted)',
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </Button>
          );
        })}
      </div>

      {/* Content area with optional sidebar */}
      <Flex gap={5}>
        {/* Main content */}
        <Box
          role="tabpanel"
          id={panelId(activeTab)}
          aria-labelledby={tabId(activeTab)}
          style={{ flex: 1, minWidth: 0, position: 'relative' }}
        >
          {loading ? (
            <Box style={{ position: 'relative', minHeight: '120px' }}>
              <Skeleton variant="rectangular" width="100%" height={120} />
              <Flex
                align="center"
                justify="center"
                style={{
                  position: 'absolute',
                  inset: 0,
                }}
              >
                <Spinner size="md" />
              </Flex>
            </Box>
          ) : (
            activeTabContent?.render()
          )}

          {/* Related records */}
          {relatedRecords && (
            <Box style={{ marginTop: '24px' }}>
              {relatedRecords}
            </Box>
          )}
        </Box>

        {/* Sidebar */}
        {showSidebar && (
          <Box
            style={{
              width: sidebarWidth,
              flexShrink: 0,
              borderLeft: '1px solid var(--ds-color-border-secondary)',
              paddingLeft: '20px',
            }}
          >
            {loading ? (
              <Stack spacing="sm">
                <Skeleton variant="text" width="50%" height={16} />
                <Skeleton variant="text" width="100%" height={14} />
                <Skeleton variant="text" width="100%" height={14} />
                <Skeleton variant="text" width="75%" height={14} />
              </Stack>
            ) : (
              <>
                <Text size="sm" weight="medium" style={{ marginBottom: '16px' }}>Details</Text>
                <Stack spacing="sm">
                  {metadata.map((field) => (
                    <Box key={field.key}>
                      <Text size="xs" color="muted">{field.label}</Text>
                      <Box style={{ marginTop: '2px' }}>
                        {typeof field.value === 'string' ? (
                          <Text size="sm">{field.value}</Text>
                        ) : (
                          field.value
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        )}
      </Flex>

      {footerSlot}
    </Stack>
  );
}
