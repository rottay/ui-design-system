'use client';

/**
 * EvContractManager - Editor Preset
 * Contract detail/edit view with terms, fee breakdown, deliverables checklist,
 * payment schedule with milestones, rider requirements, notes/history log,
 * and financial summary
 */

import { useState, useMemo } from 'react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createProgressBarStyle,
  createFilterPillStyle,
} from '../../../helpers';
import type { EvContractManagerProps, ArtistContract, PaymentSchedule } from '../../core';

const MOCK_CONTRACT: ArtistContract = {
  id: 'c3', artistName: 'The Voltage', eventName: 'Bass Drop Festival 2026', fee: 12000, currency: 'USD', status: 'draft', startDate: new Date('2026-03-08'), endDate: new Date('2026-03-09'), deliverables: ['3-hour headline set', 'After party DJ set (1hr)', 'VIP meet & greet (30 min)', 'Media appearance / press interview', 'Social media promotion (2 posts)', 'Soundcheck attendance'],
};

const MOCK_PAYMENTS: PaymentSchedule[] = [
  { id: 'p1', description: 'Booking deposit (20%)', amount: 2400, dueDate: new Date('2026-02-01'), status: 'paid' },
  { id: 'p2', description: 'Pre-production (30%)', amount: 3600, dueDate: new Date('2026-02-15'), status: 'pending' },
  { id: 'p3', description: 'Show day advance (30%)', amount: 3600, dueDate: new Date('2026-03-08'), status: 'pending' },
  { id: 'p4', description: 'Final settlement (20%)', amount: 2400, dueDate: new Date('2026-03-15'), status: 'pending' },
];

const MOCK_RIDER = [
  { category: 'Technical', items: ['Full PA system (min 20kW)', 'Monitor wedges x4', 'DJ booth with Pioneer CDJ-3000 x2', 'Allen & Heath Xone:96 mixer'] },
  { category: 'Hospitality', items: ['Private dressing room', 'Bottled water x12', 'Fresh fruit platter', 'Towels x4'] },
  { category: 'Travel', items: ['Airport transfer', 'Hotel accommodation (1 night)', 'Parking pass x2'] },
];

const MOCK_NOTES = [
  { id: 'n1', author: 'Sarah K.', date: new Date('2026-02-05'), text: 'Contract sent to management for review' },
  { id: 'n2', author: 'Carlos R.', date: new Date('2026-02-03'), text: 'Artist confirmed availability for March 8-9' },
  { id: 'n3', author: 'Sarah K.', date: new Date('2026-02-01'), text: 'Initial fee negotiation complete - agreed on $12,000' },
  { id: 'n4', author: 'System', date: new Date('2026-01-28'), text: 'Contract created from template: Headline Artist' },
];

export const EditorEvContractManager = createPreset<EvContractManagerProps>({
  name: 'EvContractManager.Editor',
  render: ({ primitives, props, tokens, engine }: PresetContext<EvContractManagerProps>) => {
    const { Box, Text } = primitives;
    const { contracts, onSignContract, onContractClick, className, style } = props;
    const isGlass = tokens.surface.useGlass && !!tokens.glass;
    const cardBase = useMemo(() => createCardStyle(tokens, { elevation: 'sm', glass: isGlass }), [tokens, isGlass]);

    const contract = contracts?.[0] || MOCK_CONTRACT;
    const [deliverableChecks, setDeliverableChecks] = useState<Record<number, boolean>>({});
    const [activeTab, setActiveTab] = useState<'details' | 'rider' | 'notes'>('details');

    const statusMap: Record<string, { badge: 'warning' | 'success' | 'error' | 'info' | 'primary'; label: string }> = {
      draft: { badge: 'primary', label: 'Draft' },
      sent: { badge: 'info', label: 'Sent' },
      negotiating: { badge: 'warning', label: 'Negotiating' },
      signed: { badge: 'success', label: 'Signed' },
      completed: { badge: 'success', label: 'Completed' },
    };

    const paymentStatusMap: Record<string, { badge: 'warning' | 'success' | 'error'; label: string }> = {
      pending: { badge: 'warning', label: 'Pending' },
      paid: { badge: 'success', label: 'Paid' },
      overdue: { badge: 'error', label: 'Overdue' },
    };

    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const sm = statusMap[contract.status];
    const completedDeliverables = Object.values(deliverableChecks).filter(Boolean).length;
    const deliverablesProgress = Math.round((completedDeliverables / contract.deliverables.length) * 100);
    const paidAmount = MOCK_PAYMENTS.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
    const pendingAmount = MOCK_PAYMENTS.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
    const paidPct = Math.round((paidAmount / contract.fee) * 100);
    const paymentBar = createProgressBarStyle(tokens, { percent: paidPct, color: tokens.colors.successScale[500] });
    const delBar = createProgressBarStyle(tokens, { percent: deliverablesProgress, color: tokens.colors.primaryScale[500] });

    return (
      <Box className={className} style={{ height: '100%', overflow: 'auto', backgroundColor: tokens.colors.neutral[50], padding: tokens.spacing[5], ...style }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[5] }}>
          <div>
            <div onClick={() => onContractClick?.('')} style={{ cursor: 'pointer' }}><Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{'\u2190'} Back to Contracts</Text></div>
            <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900], display: 'block' }}>
              {contract.artistName}
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[500] }}>{contract.eventName} | {formatDate(contract.startDate)} - {formatDate(contract.endDate)}</Text>
          </div>
          <div style={{ display: 'flex', gap: tokens.spacing[2], alignItems: 'center' }}>
            <span style={createBadgeStyle(tokens, sm.badge as 'warning' | 'success' | 'info')}>{sm.label}</span>
            {contract.status !== 'signed' && contract.status !== 'completed' && (
              <button onClick={() => onSignContract?.(contract.id)} style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.successScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, cursor: 'pointer' }}>
                Sign Contract
              </button>
            )}
          </div>
        </div>

        {/* Financial Summary Bar */}
        <div style={{ ...cardBase, padding: tokens.spacing[4], marginBottom: tokens.spacing[4], background: `linear-gradient(135deg, ${tokens.colors.primaryScale[600]}, ${tokens.colors.primaryScale[800]})` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200], display: 'block' }}>CONTRACT VALUE</Text>
              <Text style={{ fontSize: tokens.typography.fontSize['2xl'], fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>${contract.fee.toLocaleString()}</Text>
            </div>
            <div style={{ display: 'flex', gap: tokens.spacing[6] }}>
              <div style={{ textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200], display: 'block' }}>Paid</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>${paidAmount.toLocaleString()}</Text>
              </div>
              <div style={{ textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200], display: 'block' }}>Pending</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>${pendingAmount.toLocaleString()}</Text>
              </div>
              <div style={{ textAlign: 'center' as const }}>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200], display: 'block' }}>Deliverables</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.common.white }}>{completedDeliverables}/{contract.deliverables.length}</Text>
              </div>
            </div>
          </div>
          <div style={{ marginTop: tokens.spacing[3] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: tokens.spacing[1] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200] }}>Payment progress</Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.primaryScale[200] }}>{paidPct}%</Text>
            </div>
            <div style={{ ...paymentBar.track, backgroundColor: 'rgba(255,255,255,0.2)' }}><div style={paymentBar.fill} /></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: tokens.spacing[1], marginBottom: tokens.spacing[4] }}>
          {(['details', 'rider', 'notes'] as const).map(tab => (
            <div key={tab} onClick={() => setActiveTab(tab)} style={createFilterPillStyle(tokens, { active: activeTab === tab })}>
              {tab === 'details' ? 'Contract Details' : tab === 'rider' ? 'Technical Rider' : 'Notes & History'}
            </div>
          ))}
        </div>

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {/* Contract Details */}
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[4] }}>Contract Details</Text>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: tokens.spacing[4] }}>
                {[
                  { label: 'Artist', value: contract.artistName },
                  { label: 'Event', value: contract.eventName },
                  { label: 'Status', value: sm.label },
                  { label: 'Start Date', value: formatDate(contract.startDate) },
                  { label: 'End Date', value: formatDate(contract.endDate) },
                  { label: 'Currency', value: contract.currency },
                ].map(field => (
                  <div key={field.label}>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block', marginBottom: tokens.spacing[1] }}>{field.label}</Text>
                    <div style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900] }}>{field.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deliverables */}
            <div style={{ ...cardBase, padding: tokens.spacing[5] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[3] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>Deliverables</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{completedDeliverables}/{contract.deliverables.length} completed</Text>
              </div>
              <div style={{ ...delBar.track, marginBottom: tokens.spacing[3] }}><div style={delBar.fill} /></div>
              {contract.deliverables.map((d, i) => (
                <div key={i} onClick={() => setDeliverableChecks(p => ({ ...p, [i]: !p[i] }))} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3], padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, marginBottom: tokens.spacing[1], cursor: 'pointer', backgroundColor: deliverableChecks[i] ? tokens.colors.successScale[50] : 'transparent', transition: 'background-color 0.15s ease' }}>
                  <div style={{ width: 20, height: 20, borderRadius: tokens.borderRadius.sm, border: `2px solid ${deliverableChecks[i] ? tokens.colors.successScale[500] : tokens.colors.neutral[300]}`, backgroundColor: deliverableChecks[i] ? tokens.colors.successScale[500] : tokens.colors.common.white, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.xs, flexShrink: 0 }}>
                    {deliverableChecks[i] ? '\u2713' : ''}
                  </div>
                  <Text style={{ fontSize: tokens.typography.fontSize.sm, color: deliverableChecks[i] ? tokens.colors.neutral[500] : tokens.colors.neutral[900], textDecoration: deliverableChecks[i] ? 'line-through' : 'none' }}>{d}</Text>
                </div>
              ))}
            </div>

            {/* Payment Schedule */}
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50], display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Payment Schedule</Text>
                <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>{MOCK_PAYMENTS.filter(p => p.status === 'paid').length}/{MOCK_PAYMENTS.length} paid</Text>
              </div>
              {MOCK_PAYMENTS.map((payment, i) => {
                const ps = paymentStatusMap[payment.status];
                const isOverdue = payment.status === 'pending' && payment.dueDate < new Date();
                return (
                  <div key={payment.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: i < MOCK_PAYMENTS.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', backgroundColor: payment.status === 'paid' ? tokens.colors.successScale[50] : isOverdue ? tokens.colors.errorScale[50] : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <div style={{ width: 28, height: 28, borderRadius: tokens.borderRadius.full, backgroundColor: payment.status === 'paid' ? tokens.colors.successScale[100] : tokens.colors.neutral[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold as number, color: payment.status === 'paid' ? tokens.colors.successScale[700] : tokens.colors.neutral[500] }}>
                        {i + 1}
                      </div>
                      <div>
                        <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{payment.description}</Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: isOverdue ? tokens.colors.errorScale[600] : tokens.colors.neutral[500] }}>Due: {formatDate(payment.dueDate)}{isOverdue ? ' (overdue)' : ''}</Text>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[3] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.neutral[900] }}>${payment.amount.toLocaleString()}</Text>
                      <span style={createBadgeStyle(tokens, isOverdue ? 'error' : ps.badge)}>{isOverdue ? 'Overdue' : ps.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rider Tab */}
        {activeTab === 'rider' && (
          <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            {MOCK_RIDER.map(section => (
              <div key={section.category} style={{ ...cardBase, padding: tokens.spacing[5] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], display: 'block', marginBottom: tokens.spacing[3] }}>{section.category} Requirements</Text>
                {section.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2], padding: `${tokens.spacing[2]}px 0`, borderBottom: i < section.items.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none' }}>
                    <div style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: tokens.colors.primaryScale[400], flexShrink: 0 }} />
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700] }}>{item}</Text>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ ...cardBase, padding: tokens.spacing[4], backgroundColor: tokens.colors.infoScale[50], borderLeft: `3px solid ${tokens.colors.infoScale[500]}` }}>
              <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.infoScale[700] }}>
                Rider requirements are contractual obligations. Failure to meet rider specifications may impact the contract terms.
              </Text>
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === 'notes' && (
          <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column' as const, gap: tokens.spacing[4] }}>
            <div style={{ ...cardBase, padding: tokens.spacing[4] }}>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[600], display: 'block', marginBottom: tokens.spacing[2] }}>Add Note</Text>
              <div style={{ display: 'flex', gap: tokens.spacing[2] }}>
                <input type="text" placeholder="Type a note..." style={{ flex: 1, padding: `${tokens.spacing[2]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[900], backgroundColor: tokens.colors.common.white, outline: 'none' }} />
                <button style={{ padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.primaryScale[600], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, cursor: 'pointer' }}>Add</button>
              </div>
            </div>
            <div style={{ ...cardBase, padding: 0, overflow: 'hidden' as const }}>
              <div style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[200]}`, backgroundColor: tokens.colors.neutral[50] }}>
                <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[700] }}>Activity Log</Text>
              </div>
              {MOCK_NOTES.map((note, i) => (
                <div key={note.id} style={{ padding: `${tokens.spacing[3]}px ${tokens.spacing[4]}px`, borderBottom: i < MOCK_NOTES.length - 1 ? `${tokens.surface.borderWidth} ${tokens.surface.borderStyle} ${tokens.colors.neutral[100]}` : 'none', display: 'flex', gap: tokens.spacing[3] }}>
                  <div style={{ width: 32, height: 32, borderRadius: tokens.borderRadius.full, backgroundColor: note.author === 'System' ? tokens.colors.neutral[100] : tokens.colors.primaryScale[100], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.bold, color: note.author === 'System' ? tokens.colors.neutral[500] : tokens.colors.primaryScale[700], flexShrink: 0 }}>
                    {note.author === 'System' ? 'SYS' : note.author.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: tokens.spacing[1] }}>
                      <Text style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900] }}>{note.author}</Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDate(note.date)}</Text>
                    </div>
                    <Text style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600] }}>{note.text}</Text>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Box>
    );
  },
});
