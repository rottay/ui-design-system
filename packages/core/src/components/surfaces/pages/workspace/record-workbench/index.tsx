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
import { Box } from '../../../../primitives/layout/Box';
import { Stack } from '../../../../primitives/layout/Stack';
import { Flex } from '../../../../primitives/layout/Flex';
import { Text } from '../../../../primitives/display/Typography';
import { Button } from '../../../../primitives/inputs/Button';
import { Skeleton } from '../../../../primitives/feedback/Skeleton';
import { Spinner } from '../../../../primitives/feedback/Spinner';

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

  return (
    <Stack
      className="ds-surface ds-record-workbench"
      data-part="root"
      data-loading={loading ? 'true' : 'false'}
      spacing="md"
    >
      {headerSlot}
      {breadcrumbs}

      {/* Record header */}
      <Flex className="ds-record-workbench__header" data-part="header" align="center" gap={4}>
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
                <Text className="ds-record-workbench__title" data-part="title" size="xl" weight="semibold">{title}</Text>
                {status && (
                  <span
                    className="ds-record-workbench__status-badge"
                    data-part="status-badge"
                    data-variant={status.variant ?? 'default'}
                    style={{
                      padding: '2px 10px',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {status.label}
                  </span>
                )}
              </Flex>
              {subtitle && <Text className="ds-record-workbench__muted-text" data-part="muted-text" size="sm" color="muted">{subtitle}</Text>}
            </Box>
          </>
        )}

        {/* Action buttons */}
        {actions && actions.length > 0 && (
          <Flex gap={2}>
            {actions.map((action) => (
              <Button
                className="ds-record-workbench__action"
                data-action-variant={action.variant ?? 'default'}
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
        className="ds-record-workbench__tab-list"
        data-part="tab-list"
        role="tablist"
        style={{
          display: 'flex',
          gap: 0,
          overflowX: 'auto',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Button
              className="ds-record-workbench__tab"
              data-active={isActive ? 'true' : 'false'}
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
                fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
              {tab.badge !== undefined && (
                <span
                  className="ds-record-workbench__tab-badge"
                  data-part="tab-badge"
                  style={{
                    marginLeft: '8px',
                    padding: '1px 6px',
                    fontSize: '11px',
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
      <Flex className="ds-record-workbench__content" data-part="content" gap={5}>
        {/* Main content */}
        <Box
          className="ds-record-workbench__tabpanel"
          data-part="tabpanel"
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
            className="ds-record-workbench__sidebar"
            data-part="sidebar"
            style={{
              width: sidebarWidth,
              flexShrink: 0,
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
                <Text className="ds-record-workbench__sidebar-title" data-part="sidebar-title" size="sm" weight="medium" style={{ marginBottom: '16px' }}>Details</Text>
                <Stack spacing="sm">
                  {metadata.map((field) => (
                    <Box key={field.key}>
                      <Text className="ds-record-workbench__muted-text" data-part="muted-text" size="xs" color="muted">{field.label}</Text>
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
