'use client';

/**
 * EvVendorMarketplace - Management Preset
 * Booked vendors table: vendor name, status, contract value, booth, setup progress.
 * Setup checklist per vendor (expandable). Status badges. Payment tracking.
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createStatusDotStyle,
} from '../../../helpers';
import type { VendorMarketplaceProps, VendorBooking } from '../../core';

const MOCK_BOOKINGS: VendorBooking[] = [
  {
    id: 'b1',
    vendorId: 'v1',
    vendorName: 'Soundwave Pro Audio',
    eventId: 'evt1',
    status: 'confirmed',
    contractValue: 5500,
    boothAssignment: 'A-12',
    setupChecklist: [
      { item: 'Contract signed', done: true },
      { item: 'Payment received', done: true },
      { item: 'Equipment list submitted', done: true },
      { item: 'Load-in time confirmed', done: false },
    ],
  },
  {
    id: 'b2',
    vendorId: 'v2',
    vendorName: 'Gourmet Street Eats',
    eventId: 'evt1',
    status: 'setup',
    contractValue: 3200,
    boothAssignment: 'F-05',
    setupChecklist: [
      { item: 'Health permit verified', done: true },
      { item: 'Menu approved', done: true },
      { item: 'Booth setup complete', done: true },
      { item: 'Equipment tested', done: false },
    ],
  },
  {
    id: 'b3',
    vendorId: 'v5',
    vendorName: 'VIP Lounge Furnishings',
    eventId: 'evt1',
    status: 'active',
    contractValue: 8900,
    boothAssignment: 'VIP-01',
    setupChecklist: [
      { item: 'Furniture delivered', done: true },
      { item: 'Layout approved', done: true },
      { item: 'Lighting installed', done: true },
      { item: 'Final inspection', done: true },
    ],
  },
  {
    id: 'b4',
    vendorId: 'v6',
    vendorName: 'Festival Security Services',
    eventId: 'evt1',
    status: 'pending',
    contractValue: 12000,
    setupChecklist: [
      { item: 'Contract sent', done: true },
      { item: 'Awaiting signature', done: false },
      { item: 'Background checks pending', done: false },
    ],
  },
];

const STATUS_CONFIG: Record<
  string,
  { color: 'warning' | 'info' | 'primary' | 'success' | 'secondary'; label: string; dotColor: string }
> = {
  pending: { color: 'warning', label: 'Pending', dotColor: '' },
  confirmed: { color: 'info', label: 'Confirmed', dotColor: '' },
  setup: { color: 'primary', label: 'Setup', dotColor: '' },
  active: { color: 'success', label: 'Active', dotColor: '' },
  completed: { color: 'secondary', label: 'Completed', dotColor: '' },
};

export const ManagementEvVendorMarketplace = createPreset<VendorMarketplaceProps>({
  name: 'EvVendorMarketplace.Management',
  render: ({ primitives, props, tokens }: PresetContext<VendorMarketplaceProps>) => {
    const { Box, Text } = primitives;
    const { bookings, onUpdateChecklist, className, style } = props;

    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm' }), [tokens]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const data = bookings?.length ? bookings : MOCK_BOOKINGS;

    const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

    const totalValue = data.reduce((sum, b) => sum + b.contractValue, 0);
    const pendingCount = data.filter((b) => b.status === 'pending').length;
    const activeCount = data.filter((b) => b.status === 'active').length;

    const getSetupProgress = (booking: VendorBooking) => {
      const done = booking.setupChecklist.filter((c) => c.done).length;
      const total = booking.setupChecklist.length;
      const percent = (done / total) * 100;
      return { done, total, percent };
    };

    STATUS_CONFIG.pending.dotColor = tokens.colors.warningScale[500];
    STATUS_CONFIG.confirmed.dotColor = tokens.colors.infoScale[500];
    STATUS_CONFIG.setup.dotColor = tokens.colors.primaryScale[500];
    STATUS_CONFIG.active.dotColor = tokens.colors.successScale[500];
    STATUS_CONFIG.completed.dotColor = tokens.colors.neutral[400];

    return (
      <Box
        className={className}
        style={{
          height: '100%',
          overflow: 'auto',
          backgroundColor: tokens.colors.neutral[50],
          padding: tokens.spacing[5],
          ...style,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: tokens.spacing[4],
          }}
        >
          <div>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                display: 'block',
              }}
            >
              {'📋'} Vendor Management
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              {data.length} booked vendors {'·'} ${totalValue.toLocaleString()} total value
            </Text>
          </div>
        </div>

        {/* KPI Summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[4],
          }}
        >
          {[
            { label: 'Total Vendors', value: data.length, color: tokens.colors.primaryScale[500] },
            { label: 'Pending', value: pendingCount, color: tokens.colors.warningScale[500] },
            { label: 'Active', value: activeCount, color: tokens.colors.successScale[500] },
            { label: 'Contract Value', value: `$${(totalValue / 1000).toFixed(1)}K`, color: tokens.colors.infoScale[500] },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                ...cardBase,
                padding: tokens.spacing[3],
                textAlign: 'center' as const,
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize['2xl'],
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: stat.color,
                  display: 'block',
                }}
              >
                {stat.value}
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                {stat.label}
              </Text>
            </div>
          ))}
        </div>

        {/* Bookings List */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
          {data.map((booking) => {
            const isExpanded = expandedBooking === booking.id;
            const statusConfig = STATUS_CONFIG[booking.status];
            const progress = getSetupProgress(booking);
            const progressBar = createProgressBarStyle(tokens, { percent: progress.percent });

            return (
              <div
                key={booking.id}
                style={{
                  ...cardBase,
                  padding: tokens.spacing[4],
                }}
              >
                {/* Booking Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: tokens.spacing[3],
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], marginBottom: tokens.spacing[1] }}>
                      <div style={createStatusDotStyle(tokens, statusConfig.dotColor)} />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.lg,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {booking.vendorName}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], flexWrap: 'wrap' as const }}>
                      <span style={createBadgeStyle(tokens, statusConfig.color)}>{statusConfig.label}</span>
                      {booking.boothAssignment && (
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {'📍'} Booth {booking.boothAssignment}
                        </Text>
                      )}
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                        {'💰'} ${booking.contractValue.toLocaleString()}
                      </Text>
                    </div>
                  </div>
                  <div
                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                    style={{
                      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
                      borderRadius: tokens.borderRadius.md,
                      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[300]}`,
                      fontSize: tokens.typography.fontSize.sm,
                      color: tokens.colors.neutral[700],
                      cursor: 'pointer',
                      ...hoverStyle,
                    }}
                  >
                    {isExpanded ? 'Hide' : 'Show'} Checklist
                  </div>
                </div>

                {/* Setup Progress Bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[600] }}>
                      Setup Progress
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>
                      {progress.done}/{progress.total} ({Math.round(progress.percent)}%)
                    </Text>
                  </div>
                  <div style={progressBar.track}>
                    <div style={progressBar.fill} />
                  </div>
                </div>

                {/* Setup Checklist (Expanded) */}
                {isExpanded && (
                  <div
                    style={{
                      marginTop: tokens.spacing[3],
                      paddingTop: tokens.spacing[3],
                      borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.xs,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.neutral[600],
                        textTransform: 'uppercase' as const,
                        letterSpacing: '0.05em',
                        display: 'block',
                        marginBottom: tokens.spacing[2],
                      }}
                    >
                      Setup Checklist
                    </Text>
                    <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[1] }}>
                      {booking.setupChecklist.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => onUpdateChecklist?.(booking.id, idx, !item.done)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacing[2],
                            padding: tokens.spacing[2],
                            borderRadius: tokens.borderRadius.sm,
                            backgroundColor: item.done
                              ? tokens.colors.successScale[50]
                              : tokens.colors.neutral[50],
                            cursor: 'pointer',
                            transition: `background-color ${tokens.motion.hover}`,
                          }}
                        >
                          <div
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: tokens.borderRadius.sm,
                              border: `2px solid ${
                                item.done ? tokens.colors.successScale[500] : tokens.colors.neutral[300]
                              }`,
                              backgroundColor: item.done
                                ? tokens.colors.successScale[500]
                                : tokens.colors.common.white,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {item.done && (
                              <span
                                style={{
                                  color: tokens.colors.common.white,
                                  fontSize: tokens.typography.fontSize.xs,
                                  fontWeight: tokens.typography.fontWeight.bold,
                                }}
                              >
                                {'✓'}
                              </span>
                            )}
                          </div>
                          <Text
                            style={{
                              fontSize: tokens.typography.fontSize.sm,
                              color: item.done ? tokens.colors.neutral[600] : tokens.colors.neutral[900],
                              textDecoration: item.done ? 'line-through' : 'none',
                            }}
                          >
                            {item.item}
                          </Text>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Box>
    );
  },
});
