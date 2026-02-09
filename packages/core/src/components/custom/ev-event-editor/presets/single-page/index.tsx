'use client';

/**
 * EvEventEditor - SinglePage Preset
 * All sections visible in one scrollable page with collapsible sections
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createHoverStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createSectionHeaderStyle,
} from '../../../helpers';
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

interface Section { key: string; label: string; emoji: string }
const SECTIONS: Section[] = [
  { key: 'details', label: 'Event Details', emoji: '\uD83C\uDFB5' },
  { key: 'dates', label: 'Dates & Venue', emoji: '\uD83D\uDCC5' },
  { key: 'tickets', label: 'Ticket Configuration', emoji: '\uD83C\uDFAB' },
  { key: 'media', label: 'Media & Branding', emoji: '\uD83D\uDDBC\uFE0F' },
  { key: 'settings', label: 'Advanced Settings', emoji: '\u2699\uFE0F' },
];

export const SinglePageEvEventEditor = createPreset<EvEventEditorProps>({
  name: 'EvEventEditor.SinglePage',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvEventEditorProps>) => {
    const { Box, Text } = primitives;
    const { formData: propForm, onSave, onPublish, className, style } = props;

    const formData = propForm && propForm.name ? propForm : MOCK_FORM;

    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);
    const hoverStyle = useMemo(() => createHoverStyle(tokens), [tokens]);

    const toggleSection = (key: string) => {
      setCollapsedSections(prev => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key); else next.add(key);
        return next;
      });
    };

    const inputStyle = {
      width: '100%',
      padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`,
      borderRadius: tokens.borderRadius.md,
      border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`,
      fontSize: tokens.typography.fontSize.sm,
      color: tokens.colors.neutral[900],
      backgroundColor: tokens.colors.common.white,
      outline: 'none',
    };

    const labelStyle = {
      fontSize: tokens.typography.fontSize.xs,
      fontWeight: tokens.typography.fontWeight.semibold,
      color: tokens.colors.neutral[600],
      display: 'block' as const,
      marginBottom: tokens.spacing[1],
    };

    const sectionHeaderStyle = (section: Section) => ({
      display: 'flex' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`,
      cursor: 'pointer',
      borderBottom: collapsedSections.has(section.key)
        ? 'none'
        : `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}`,
    });

    const totalRevPotential = (formData.ticketTypes || []).reduce((s: number, t: any) => s + t.price * t.quantity, 0);
    const totalCapacity = (formData.ticketTypes || []).reduce((s: number, t: any) => s + t.quantity, 0);

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[6], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: tokens.spacing[5] }}>
          <div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[1] }}>
              {'\u270F\uFE0F'} {formData.name || 'New Event'}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>
              All sections visible - edit any field below
            </Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
            <div onClick={() => onSave?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, backgroundColor: tokens.colors.neutral[100], color: tokens.colors.neutral[700], borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', ...hoverStyle }}>
              {'\uD83D\uDCBE'} Save Draft
            </div>
            <div onClick={() => onPublish?.(formData as any)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, borderRadius: tokens.borderRadius.md, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer', ...hoverStyle }}>
              {'\uD83D\uDE80'} Publish
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div style={{ display: 'flex', gap: tokens.spacing[4], marginBottom: tokens.spacing[5] }}>
          {[
            { label: 'Ticket Types', value: (formData.ticketTypes || []).length.toString(), emoji: '\uD83C\uDFAB' },
            { label: 'Total Capacity', value: totalCapacity.toLocaleString(), emoji: '\uD83D\uDC65' },
            { label: 'Revenue Potential', value: `$${totalRevPotential.toLocaleString()}`, emoji: '\uD83D\uDCB0' },
            { label: 'Event Days', value: (formData.dates || []).length.toString(), emoji: '\uD83D\uDCC5' },
          ].map((stat, i) => (
            <div key={i} style={{ ...cardBase, flex: 1, textAlign: 'center' as const, padding: tokens.spacing[3] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.lg, display: 'block' }}>{stat.emoji}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>{stat.value}</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{stat.label}</Text>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
          {/* Event Details Section */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div onClick={() => toggleSection('details')} style={sectionHeaderStyle(SECTIONS[0])}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md }}>{'\uD83C\uDFB5'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Event Details</Text>
                <span style={createBadgeStyle(tokens, 'success')}>{'\u2713'} Complete</span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{collapsedSections.has('details') ? '\u25B6' : '\u25BC'}</Text>
            </div>
            {!collapsedSections.has('details') && (
              <div style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                <div>
                  <Text style={labelStyle}>Event Name</Text>
                  <input type="text" value={formData.name || ''} readOnly style={inputStyle} />
                </div>
                <div>
                  <Text style={labelStyle}>Description</Text>
                  <textarea readOnly value={formData.description || ''} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' as const }} />
                </div>
              </div>
            )}
          </div>

          {/* Dates & Venue Section */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div onClick={() => toggleSection('dates')} style={sectionHeaderStyle(SECTIONS[1])}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md }}>{'\uD83D\uDCC5'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Dates & Venue</Text>
                <span style={createBadgeStyle(tokens, 'success')}>{'\u2713'} Complete</span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{collapsedSections.has('dates') ? '\u25B6' : '\u25BC'}</Text>
            </div>
            {!collapsedSections.has('dates') && (
              <div style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                <div>
                  <Text style={labelStyle}>Venue</Text>
                  <div style={{ ...inputStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{'\uD83C\uDFDB\uFE0F'} Arena Complex</Text>
                    <span style={createBadgeStyle(tokens, 'success')}>Available</span>
                  </div>
                </div>
                {(formData.dates || []).map((d: any, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: tokens.spacing[3], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
                    <div style={{ flex: 2 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Day {i + 1}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>
                        {d.date instanceof Date ? d.date.toLocaleDateString() : String(d.date)}
                      </Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Start</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{d.startTime}</Text>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>End</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{d.endTime}</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ticket Configuration Section */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div onClick={() => toggleSection('tickets')} style={sectionHeaderStyle(SECTIONS[2])}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md }}>{'\uD83C\uDFAB'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Ticket Configuration</Text>
                <span style={createBadgeStyle(tokens, 'info')}>{(formData.ticketTypes || []).length} types</span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{collapsedSections.has('tickets') ? '\u25B6' : '\u25BC'}</Text>
            </div>
            {!collapsedSections.has('tickets') && (
              <div style={{ padding: tokens.spacing[4] }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
                  <thead>
                    <tr>
                      {['Type', 'Price', 'Quantity', 'Revenue'].map(h => (
                        <th key={h} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, textAlign: 'left' as const, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(formData.ticketTypes || []).map((t: any, i: number) => (
                      <tr key={i}>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{t.name}</Text>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.successScale[700], fontWeight: tokens.typography.fontWeight.semibold }}>${t.price}</Text>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{t.quantity.toLocaleString()}</Text>
                        </td>
                        <td style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` }}>
                          <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>${(t.price * t.quantity).toLocaleString()}</Text>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: `${tokens.spacing[3]}px`, borderTop: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, marginTop: tokens.spacing[2] }}>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                    Total: ${totalRevPotential.toLocaleString()}
                  </Text>
                </div>
              </div>
            )}
          </div>

          {/* Media & Branding Section */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div onClick={() => toggleSection('media')} style={sectionHeaderStyle(SECTIONS[3])}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md }}>{'\uD83D\uDDBC\uFE0F'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Media & Branding</Text>
                <span style={createBadgeStyle(tokens, 'warning')}>{'\u26A0\uFE0F'} Incomplete</span>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{collapsedSections.has('media') ? '\u25B6' : '\u25BC'}</Text>
            </div>
            {!collapsedSections.has('media') && (
              <div style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                <div style={{ height: 120, borderRadius: tokens.borderRadius.md, border: `2px dashed ${tokens.colors.neutral[300]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: tokens.colors.neutral[50] }}>
                  <div style={{ textAlign: 'center' as const }}>
                    <Text style={{ fontSize: tokens.typography.fontSize['2xl'], display: 'block' }}>{'\uD83D\uDCF7'}</Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>Upload cover image (1920x600 recommended)</Text>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: tokens.spacing[3] }}>
                  {['\uD83C\uDFA8 Brand Color', '\uD83D\uDCCE Logo', '\uD83C\uDFAC Promo Video'].map(item => (
                    <div key={item} style={{ flex: 1, height: 60, borderRadius: tokens.borderRadius.md, border: `2px dashed ${tokens.colors.neutral[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{item}</Text>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Advanced Settings Section */}
          <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
            <div onClick={() => toggleSection('settings')} style={sectionHeaderStyle(SECTIONS[4])}>
              <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md }}>{'\u2699\uFE0F'}</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Advanced Settings</Text>
              </div>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[400] }}>{collapsedSections.has('settings') ? '\u25B6' : '\u25BC'}</Text>
            </div>
            {!collapsedSections.has('settings') && (
              <div style={{ padding: tokens.spacing[4], display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[3] }}>
                {[
                  { label: 'Enable waitlist when sold out', checked: true },
                  { label: 'Allow ticket transfers', checked: true },
                  { label: 'Require photo ID at check-in', checked: false },
                  { label: 'Send reminder emails 24h before', checked: true },
                ].map((toggle, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[2]}px 0` }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{toggle.label}</Text>
                    <div style={{ width: 40, height: 22, borderRadius: tokens.borderRadius.full, backgroundColor: toggle.checked ? tokens.colors.primaryScale[500] : tokens.colors.neutral[200], display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer' }}>
                      <div style={{ width: 18, height: 18, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.common.white, marginLeft: toggle.checked ? 18 : 0, transition: 'margin-left 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Box>
    );
  },
});
