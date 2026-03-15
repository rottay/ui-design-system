'use client';

/**
 * EvEventEditor - SinglePage Preset
 * Composes PatternFormBuilder + PatternStatsGrid + PatternDataTable
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  PatternFormBuilder,
  PatternStatsGrid,
  PatternDataTable,
  column,
  columns,
} from '../../../../patterns';
import type { FieldDef, StatDef, ColumnDef } from '../../../../patterns';
import { createCardStyle, createHoverStyle, createBadgeStyle } from '../../../helpers';
import type { EvEventEditorProps } from '../../core';

const MOCK_FORM = {
  name: 'Summer Music Festival',
  description: 'The biggest outdoor music festival of the summer featuring top artists from around the world. Three stages, food vendors, and art installations.',
  venueId: 'arena-complex',
  dates: [{ date: new Date('2026-06-20'), startTime: '14:00', endTime: '23:00' }, { date: new Date('2026-06-21'), startTime: '12:00', endTime: '23:00' }],
  ticketTypes: [
    { name: 'General Admission', price: 45, quantity: 3000 },
    { name: 'VIP', price: 120, quantity: 500 },
    { name: 'Backstage Pass', price: 250, quantity: 100 },
  ],
};

type TicketTypeRow = { name: string; price: number; quantity: number };

export const SinglePageEvEventEditor = createPreset<EvEventEditorProps>({
  name: 'EvEventEditor.SinglePage',
  render: ({ primitives, props, tokens }: PresetContext<EvEventEditorProps>) => {
    const { Box, Text } = primitives;
    const { formData: propForm, onSave, onPublish, className, style } = props;

    const formData = propForm && propForm.name ? propForm : MOCK_FORM;

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const totalRevPotential = (formData.ticketTypes || []).reduce((s: number, t: any) => s + t.price * t.quantity, 0);
    const totalCapacity = (formData.ticketTypes || []).reduce((s: number, t: any) => s + t.quantity, 0);

    const quickStats = useMemo((): StatDef[] => [
      { key: 'types', label: 'Ticket Types', value: (formData.ticketTypes || []).length },
      { key: 'capacity', label: 'Total Capacity', value: totalCapacity.toLocaleString() },
      { key: 'revenue', label: 'Revenue Potential', value: `$${totalRevPotential.toLocaleString()}` },
      { key: 'days', label: 'Event Days', value: (formData.dates || []).length },
    ], [formData, totalRevPotential, totalCapacity]);

    const detailsFields = useMemo((): FieldDef[] => [
      { name: 'name', label: 'Event Name', type: 'text', required: true, defaultValue: formData.name },
      { name: 'description', label: 'Description', type: 'textarea', required: true, defaultValue: formData.description },
    ], [formData]);

    const venueFields = useMemo((): FieldDef[] => [
      { name: 'venueId', label: 'Venue', type: 'select', options: [{ label: 'Arena Complex', value: 'arena-complex' }], defaultValue: formData.venueId },
    ], [formData]);

    const ticketColumns = useMemo(() => columns<TicketTypeRow>([
      column<TicketTypeRow, 'name'>('name', { header: 'Type' }),
      column<TicketTypeRow, 'price'>('price', {
        header: 'Price',
        render: (_v, row) => <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.successScale[700], fontWeight: tokens.typography.fontWeight.semibold }}>${row.price}</Text>,
      }),
      column<TicketTypeRow, 'quantity'>('quantity', {
        header: 'Quantity',
        render: (_v, row) => <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{row.quantity.toLocaleString()}</Text>,
      }),
      {
        key: 'revenue',
        header: 'Revenue',
        accessorFn: (row: TicketTypeRow) => row.price * row.quantity,
        render: (_v: unknown, row: TicketTypeRow) => (
          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>${(row.price * row.quantity).toLocaleString()}</Text>
        ),
      } as ColumnDef<TicketTypeRow>,
    ]), [tokens]);

    const settingsFields = useMemo((): FieldDef[] => [
      { name: 'enableWaitlist', label: 'Enable waitlist when sold out', type: 'switch', defaultValue: true },
      { name: 'allowTransfers', label: 'Allow ticket transfers', type: 'switch', defaultValue: true },
      { name: 'requirePhotoId', label: 'Require photo ID at check-in', type: 'switch', defaultValue: false },
      { name: 'sendReminders', label: 'Send reminder emails 24h before', type: 'switch', defaultValue: true },
    ], []);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {formData.name || 'New Event'}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              All sections visible - edit any field below
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <div onClick={() => onSave?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
              Save Draft
            </div>
            <div onClick={() => onPublish?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
              Publish
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <PatternStatsGrid stats={quickStats} columns={4} variant="default" style={{ marginBottom: tokens.spacing[5] }} />

        {/* Event Details */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Event Details</Text>
          <PatternFormBuilder
            fields={detailsFields}
            layout="vertical"
            initialValues={formData as Record<string, unknown>}
            onSubmit={() => {}}
            showLabels
          />
        </div>

        {/* Dates & Venue */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Dates & Venue</Text>
          <PatternFormBuilder
            fields={venueFields}
            layout="vertical"
            initialValues={formData as Record<string, unknown>}
            onSubmit={() => {}}
            showLabels
          />
        </div>

        {/* Ticket Configuration */}
        <div style={{ ...cardBase, marginBottom: tokens.spacing[4], padding: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Ticket Configuration</Text>
          <PatternDataTable
            data={(formData.ticketTypes || []) as TicketTypeRow[]}
            columns={ticketColumns}
            rowKey="name"
            compact
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                  Total: ${totalRevPotential.toLocaleString()}
                </Text>
              </div>
            }
          />
        </div>

        {/* Advanced Settings */}
        <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
          <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>Advanced Settings</Text>
          <PatternFormBuilder
            fields={settingsFields}
            layout="vertical"
            initialValues={{ enableWaitlist: true, allowTransfers: true, requirePhotoId: false, sendReminders: true }}
            onSubmit={() => {}}
            showLabels
          />
        </div>
      </Box>
    );
  },
});
