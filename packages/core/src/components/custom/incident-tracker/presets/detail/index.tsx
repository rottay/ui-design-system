'use client';

import { createPreset, PresetContext } from '../../../factory';
import type { IncidentTrackerProps } from '../../core';
import { getIncidentSeverityColors, getIncidentStatusColors } from '../../core';
import { createCardStyle, createPanelHeaderStyle, createAccentBarStyle, createStatusDotStyle } from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const DetailIncidentTracker = createPreset<IncidentTrackerProps>({
  name: 'IncidentTracker.Detail',
  render: ({ primitives, props, tokens }: PresetContext<IncidentTrackerProps>) => {
    const { Box, Stack } = primitives;
    const sevColors = getIncidentSeverityColors(tokens);
    const statColors = getIncidentStatusColors(tokens);

    const { incidents, selectedIncidentId, onStatusChange, title, loading, className, style } = props;

    const incident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

    if (loading || !incident) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>{loading ? 'Loading...' : 'No incident selected'}</Box>;
    }

    const sev = sevColors[incident.severity];
    const stat = statColors[incident.status];
    const sorted = [...incident.updates].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: sev.dot })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title || incident.title}</h3>
            <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[1] }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: sev.bg, color: sev.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>{incident.severity}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: stat.bg, color: stat.color, fontSize: tokens.typography.fontSize.xs }}>
                <span style={{ width: 5, height: 5, borderRadius: tokens.borderRadius.full, backgroundColor: stat.dot, display: 'inline-block' }} />{incident.status}
              </span>
              <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], textTransform: 'capitalize' as const }}>{incident.type}</span>
            </Box>
          </Box>
        </Box>

        <Box style={{ padding: tokens.spacing[4] }}>
          {incident.description && <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[700], margin: `0 0 ${tokens.spacing[3]}px`, lineHeight: 1.5 }}>{incident.description}</p>}

          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: tokens.spacing[3], marginBottom: tokens.spacing[4], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
            {[
              { label: 'Reported', value: formatDistanceToNow(incident.reportedAt, { addSuffix: true }) },
              { label: 'Assignee', value: incident.assignee?.name || 'Unassigned' },
              { label: 'Impact', value: incident.impactLevel || '—' },
              { label: 'Resolved', value: incident.resolvedAt ? formatDistanceToNow(incident.resolvedAt, { addSuffix: true }) : 'Ongoing' },
            ].map(f => (
              <Box key={f.label}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{f.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{f.value}</span>
              </Box>
            ))}
          </Box>

          {incident.affectedSystems && incident.affectedSystems.length > 0 && (
            <Box style={{ marginBottom: tokens.spacing[3] }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[500], textTransform: 'uppercase' as const, display: 'block', marginBottom: tokens.spacing[1] }}>Affected Systems</span>
              <Box style={{ display: 'flex', gap: tokens.spacing[1], flexWrap: 'wrap' }}>
                {incident.affectedSystems.map(s => (
                  <span key={s} style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: tokens.colors.errorScale[50], color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.xs }}>{s}</span>
                ))}
              </Box>
            </Box>
          )}

          {incident.rootCause && (
            <Box style={{ marginBottom: tokens.spacing[3], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.warningScale[50], border: `1px solid ${tokens.colors.warningScale[200]}` }}>
              <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.warningScale[700], display: 'block', marginBottom: tokens.spacing[1] }}>Root Cause</span>
              <span style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.warningScale[800] }}>{incident.rootCause}</span>
            </Box>
          )}

          {/* Timeline */}
          <h4 style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: `0 0 ${tokens.spacing[2]}px` }}>Updates ({sorted.length})</h4>
          {sorted.map((update, idx) => {
            const isLast = idx === sorted.length - 1;
            const uStatColors = update.status ? statColors[update.status] : null;

            return (
              <Box key={update.id} style={{ display: 'flex', gap: tokens.spacing[3] }}>
                <Box style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0 }}>
                  <span style={{ ...createStatusDotStyle(tokens, uStatColors?.dot || tokens.colors.neutral[400]), width: 8, height: 8, marginTop: tokens.spacing[1], zIndex: 1 }} />
                  {!isLast && <Box style={{ width: 2, flex: 1, backgroundColor: tokens.colors.neutral[200], marginTop: tokens.spacing[1] }} />}
                </Box>
                <Box style={{ flex: 1, paddingBottom: tokens.spacing[3] }}>
                  <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[700] }}>{update.author}</span>
                    <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDistanceToNow(update.timestamp, { addSuffix: true })}</span>
                  </Box>
                  <p style={{ fontSize: tokens.typography.fontSize.sm, color: tokens.colors.neutral[600], margin: `${tokens.spacing[1]}px 0 0` }}>{update.message}</p>
                  {update.status && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], marginTop: tokens.spacing[1], padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: uStatColors!.bg, color: uStatColors!.color, fontSize: tokens.typography.fontSize.xs }}>
                      Status → {update.status}
                    </span>
                  )}
                </Box>
              </Box>
            );
          })}

          {onStatusChange && incident.status !== 'closed' && (
            <Box style={{ display: 'flex', gap: tokens.spacing[2], marginTop: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[200]}`, paddingTop: tokens.spacing[3] }}>
              {incident.status !== 'resolved' && (
                <button onClick={() => onStatusChange(incident.id, 'resolved')} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white, fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit' }}>Resolve</button>
              )}
              <button onClick={() => onStatusChange(incident.id, 'closed')} style={{ padding: `${tokens.spacing[1]}px ${tokens.spacing[3]}px`, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[300]}`, backgroundColor: tokens.colors.common.white, color: tokens.colors.neutral[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
