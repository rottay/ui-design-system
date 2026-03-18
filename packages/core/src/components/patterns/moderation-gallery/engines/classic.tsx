'use client';

/**
 * @fileoverview Classic engine for the ModerationGallery pattern.
 * Renders a grid of media cards with status overlay, action buttons
 * on hover, engagement metrics, bulk selection checkboxes, and a
 * bulk action toolbar.
 */

import React, { useState, useCallback } from 'react';
import { Box, Flex, Grid } from '../../../primitives/layout';
import { Text, Tag } from '../../../primitives/display';
import { Button, Checkbox } from '../../../primitives/inputs';
import type { ModerationGalleryProps, ModerationItem, ModerationBulkAction } from '../ModerationGallery.types';

/** Status color mapping using CSS variables. */
const STATUS_COLORS: Record<ModerationItem['status'], string> = {
  pending: 'var(--ds-color-warning)',
  approved: 'var(--ds-color-success)',
  rejected: 'var(--ds-color-error)',
};

/** Status label mapping. */
const STATUS_LABELS: Record<ModerationItem['status'], string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

/** Tag color for Ant Design. */
const STATUS_TAG_COLORS: Record<ModerationItem['status'], string> = {
  pending: 'orange',
  approved: 'green',
  rejected: 'red',
};

/** Formats relative time from an ISO timestamp. */
function formatUploadTime(ts: string): string {
  const date = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Video play icon SVG. */
function PlayIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}

/**
 * Classic engine ModerationGallery.
 * Renders a responsive grid of media cards with status overlay,
 * hover actions, engagement metrics, and bulk selection.
 */
export default function ClassicModerationGallery(props: ModerationGalleryProps) {
  const {
    items,
    onApprove,
    onReject,
    onBulkAction,
    selectable = false,
    emptyMessage = 'No media items to review',
    loading,
    className,
    style,
  } = props;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleBulkAction = useCallback(
    (action: ModerationBulkAction) => {
      if (onBulkAction) {
        onBulkAction(action, Array.from(selectedIds));
        setSelectedIds(new Set());
      }
    },
    [onBulkAction, selectedIds]
  );

  if (loading) {
    return (
      <Box className={className} style={style}>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <Box
              key={`skel-${i}`}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                background: 'var(--ds-color-bg-secondary)',
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  if (items.length === 0) {
    return (
      <Box
        className={`ds-pattern-moderation-gallery ds-engine-classic ${className ?? ''}`}
        style={{
          padding: '40px 24px',
          background: 'var(--ds-color-bg-primary)',
          borderRadius: 12,
          border: '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
          textAlign: 'center' as const,
          ...style,
        }}
      >
        <Text style={{ fontSize: 14, color: 'var(--ds-color-text-muted)' }}>
          {emptyMessage}
        </Text>
      </Box>
    );
  }

  return (
    <Box
      className={`ds-pattern-moderation-gallery ds-engine-classic ${className ?? ''}`}
      style={style}
    >
      {/* Bulk action toolbar */}
      {selectable && selectedIds.size > 0 && onBulkAction && (
        <Flex
          align="center"
          gap={12}
          style={{
            padding: '10px 20px',
            marginBottom: 12,
            background: 'color-mix(in srgb, var(--ds-color-primary) 8%, transparent)',
            borderRadius: 8,
            border: '1px solid color-mix(in srgb, var(--ds-color-primary) 20%, transparent)',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 600, color: 'var(--ds-color-primary)' }}>
            {selectedIds.size} selected
          </Text>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleBulkAction('approve')}
          >
            Approve All
          </Button>
          <Button
            size="sm"
            danger
            onClick={() => handleBulkAction('reject')}
          >
            Reject All
          </Button>
          <Button
            size="sm"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear
          </Button>
        </Flex>
      )}

      {/* Media grid */}
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}
      >
        {items.map((item) => {
          const isHovered = hoveredId === item.id;
          const isSelected = selectedIds.has(item.id);

          return (
            <Box
              key={item.id}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                position: 'relative' as const,
                borderRadius: 12,
                overflow: 'hidden',
                border: isSelected
                  ? '2px solid var(--ds-color-primary)'
                  : '1px solid var(--ds-color-border, color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent))',
                background: 'var(--ds-color-bg-primary)',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                transform: isHovered ? 'translateY(-2px)' : 'none',
                boxShadow: isHovered
                  ? '0 4px 16px color-mix(in srgb, var(--ds-color-text-primary) 8%, transparent)'
                  : 'none',
              }}
            >
              {/* Thumbnail */}
              <Box
                style={{
                  position: 'relative' as const,
                  aspectRatio: '1',
                  overflow: 'hidden',
                  background: 'var(--ds-color-bg-secondary)',
                }}
              >
                <img
                  src={item.thumbnailUrl}
                  alt={`Media by ${item.uploadedBy}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover' as const,
                    display: 'block',
                  }}
                />

                {/* Video play overlay */}
                {item.type === 'video' && (
                  <Flex
                    justify="center"
                    align="center"
                    style={{
                      position: 'absolute' as const,
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      color: 'white',
                      background: 'rgba(0, 0, 0, 0.2)',
                      pointerEvents: 'none' as const,
                    }}
                  >
                    <Box
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingLeft: 3,
                      }}
                    >
                      <PlayIcon />
                    </Box>
                  </Flex>
                )}

                {/* Status badge overlay */}
                <Box
                  style={{
                    position: 'absolute' as const,
                    top: 8,
                    left: 8,
                  }}
                >
                  <Tag color={STATUS_TAG_COLORS[item.status]} style={{ fontSize: 11 }}>
                    {STATUS_LABELS[item.status]}
                  </Tag>
                </Box>

                {/* Selection checkbox */}
                {selectable && (
                  <Box
                    style={{
                      position: 'absolute' as const,
                      top: 8,
                      right: 8,
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => toggleSelection(item.id)}
                    />
                  </Box>
                )}

                {/* Hover action overlay */}
                {isHovered && (onApprove || onReject) && (
                  <Flex
                    justify="center"
                    align="center"
                    gap={8}
                    style={{
                      position: 'absolute' as const,
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: '12px',
                      background: 'linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent)',
                    }}
                  >
                    {onApprove && item.status !== 'approved' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onApprove(item.id)}
                      >
                        Approve
                      </Button>
                    )}
                    {onReject && item.status !== 'rejected' && (
                      <Button
                        size="sm"
                        danger
                        onClick={() => onReject(item.id)}
                      >
                        Reject
                      </Button>
                    )}
                  </Flex>
                )}
              </Box>

              {/* Item info footer */}
              <Flex
                justify="between"
                align="center"
                style={{
                  padding: '8px 12px',
                }}
              >
                <Flex direction="column" gap={2}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: 'var(--ds-color-text-primary)',
                    }}
                  >
                    {item.uploadedBy}
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: 'var(--ds-color-text-muted)',
                    }}
                  >
                    {formatUploadTime(item.uploadedAt)}
                  </Text>
                </Flex>
                {item.engagement != null && (
                  <Text
                    style={{
                      fontSize: 11,
                      color: 'var(--ds-color-text-muted)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {item.engagement.toLocaleString()} views
                  </Text>
                )}
              </Flex>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
