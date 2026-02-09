'use client';

/**
 * KycVerificationFlow - Review Preset
 * Admin review panel for KYC verification
 */

import { createPreset, PresetContext } from '../../../factory';
import type { KycVerificationFlowProps } from '../../core';
import { getKycStatusColors, getCheckStatusColors, getRiskColors } from '../../core';
import {
  createCardStyle,
  createPanelHeaderStyle,
  createListItemStyle,
  createAccentBarStyle,
} from '../../../helpers';
import { formatDistanceToNow } from '../../../helpers';

export const ReviewKycVerificationFlow = createPreset<KycVerificationFlowProps>({
  name: 'KycVerificationFlow.Review',
  render: ({ primitives, props, tokens }: PresetContext<KycVerificationFlowProps>) => {
    const { Box, Stack } = primitives;
    const statusColors = getKycStatusColors(tokens);
    const checkColors = getCheckStatusColors(tokens);
    const riskColors = getRiskColors(tokens);

    const {
      verification,
      onApprove,
      onReject,
      onRequestInfo,
      title = 'KYC Review',
      loading,
      className,
      style,
    } = props;

    const vColors = statusColors[verification.status];
    const subject = verification.subject;

    if (loading) {
      return <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), padding: tokens.spacing[6], textAlign: 'center', color: tokens.colors.neutral[400], ...style }}>Loading...</Box>;
    }

    return (
      <Box className={className} style={{ ...createCardStyle(tokens, { elevation: 'sm' }), overflow: 'hidden', ...style }}>
        <Box style={createAccentBarStyle(tokens, { position: 'top', color: vColors.dot })} />

        <Box style={{ ...createPanelHeaderStyle(tokens), display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: tokens.typography.fontSize.lg, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: 0 }}>{title}</h3>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: tokens.spacing[1], padding: `${tokens.spacing[0]}px ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: vColors.bg, color: vColors.color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.medium }}>
            <span style={{ width: 6, height: 6, borderRadius: tokens.borderRadius.full, backgroundColor: vColors.dot, display: 'inline-block' }} />
            {verification.status}
          </span>
        </Box>

        <Box style={{ padding: tokens.spacing[4] }}>
          {/* Subject Info */}
          <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: tokens.spacing[3], marginBottom: tokens.spacing[4], padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, backgroundColor: tokens.colors.neutral[50] }}>
            {[
              { label: 'Name', value: subject.name },
              { label: 'Email', value: subject.email },
              { label: 'DOB', value: subject.dateOfBirth || '—' },
              { label: 'Nationality', value: subject.nationality || '—' },
              { label: 'Level', value: verification.level },
            ].map(f => (
              <Box key={f.label}>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>{f.label}</span>
                <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{f.value}</span>
              </Box>
            ))}
            {subject.riskLevel && (
              <Box>
                <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500], display: 'block' }}>Risk</span>
                <span style={{ display: 'inline-block', padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.sm, backgroundColor: riskColors[subject.riskLevel].bg, color: riskColors[subject.riskLevel].color, fontSize: tokens.typography.fontSize.xs, fontWeight: tokens.typography.fontWeight.semibold }}>
                  {subject.riskLevel} {subject.riskScore !== undefined && `(${subject.riskScore})`}
                </span>
              </Box>
            )}
          </Box>

          {/* Checks */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <h4 style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: `0 0 ${tokens.spacing[2]}px` }}>Verification Checks</h4>
            {verification.checks.map((check) => {
              const cColors = checkColors[check.status];
              return (
                <Box key={check.id} style={{
                  ...createListItemStyle(tokens),
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ width: 24, height: 24, borderRadius: tokens.borderRadius.full, backgroundColor: cColors.bg, color: cColors.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: tokens.typography.fontSize.xs }}>{cColors.icon}</span>
                    <Box>
                      <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900] }}>{check.type.replace(/-/g, ' ')}</span>
                      {check.provider && <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>via {check.provider}</span>}
                    </Box>
                  </Box>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                    <span style={{ padding: `0 ${tokens.spacing[2]}px`, borderRadius: tokens.borderRadius.full, backgroundColor: cColors.bg, color: cColors.color, fontSize: tokens.typography.fontSize.xs }}>{check.status}</span>
                    {check.completedAt && <span style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[400] }}>{formatDistanceToNow(check.completedAt, { addSuffix: true })}</span>}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* Documents */}
          <Box style={{ marginBottom: tokens.spacing[4] }}>
            <h4 style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.semibold, color: tokens.colors.neutral[900], margin: `0 0 ${tokens.spacing[2]}px` }}>Documents</h4>
            <Box style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: tokens.spacing[2] }}>
              {verification.documents.map((doc) => (
                <Box key={doc.id} style={{ padding: tokens.spacing[3], borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.neutral[200]}` }}>
                  <span style={{ fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, color: tokens.colors.neutral[900], display: 'block' }}>{doc.type.replace(/-/g, ' ')}</span>
                  <span style={{
                    display: 'inline-block', marginTop: tokens.spacing[1],
                    padding: `0 ${tokens.spacing[1]}px`, borderRadius: tokens.borderRadius.sm,
                    backgroundColor: doc.status === 'verified' ? tokens.colors.successScale[50] : doc.status === 'rejected' ? tokens.colors.errorScale[50] : tokens.colors.neutral[100],
                    color: doc.status === 'verified' ? tokens.colors.successScale[700] : doc.status === 'rejected' ? tokens.colors.errorScale[700] : tokens.colors.neutral[600],
                    fontSize: tokens.typography.fontSize.xs,
                  }}>{doc.status}</span>
                  {doc.rejectionReason && <span style={{ display: 'block', fontSize: tokens.typography.fontSize.xs, color: tokens.colors.errorScale[600], marginTop: tokens.spacing[1] }}>{doc.rejectionReason}</span>}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Actions */}
          {(verification.status === 'in-review' || verification.status === 'pending') && (
            <Box style={{ display: 'flex', gap: tokens.spacing[2], borderTop: `1px solid ${tokens.colors.neutral[200]}`, paddingTop: tokens.spacing[3] }}>
              {onApprove && (
                <button onClick={() => onApprove(verification.id)} style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md,
                  border: 'none', backgroundColor: tokens.colors.successScale[500], color: tokens.colors.common.white,
                  fontSize: tokens.typography.fontSize.sm, fontWeight: tokens.typography.fontWeight.medium, cursor: 'pointer', fontFamily: 'inherit',
                }}>Approve</button>
              )}
              {onRequestInfo && (
                <button onClick={() => onRequestInfo(verification.id)} style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.warningScale[300]}`, backgroundColor: tokens.colors.warningScale[50],
                  color: tokens.colors.warningScale[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                }}>Request Info</button>
              )}
              {onReject && (
                <button onClick={() => onReject(verification.id, '')} style={{
                  padding: `${tokens.spacing[2]}px ${tokens.spacing[4]}px`, borderRadius: tokens.borderRadius.md,
                  border: `1px solid ${tokens.colors.errorScale[300]}`, backgroundColor: tokens.colors.common.white,
                  color: tokens.colors.errorScale[700], fontSize: tokens.typography.fontSize.sm, cursor: 'pointer', fontFamily: 'inherit',
                }}>Reject</button>
              )}
            </Box>
          )}
        </Box>
      </Box>
    );
  },
});
