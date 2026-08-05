'use client';

/**
 * FEEDBACK group scene — Alert + Skeleton + Spinner.
 *
 * The lifecycle families are where two laws meet and can fight:
 *
 *   - semantic status colour must remain accessible and must NOT be drained to
 *     grey, even under a monochrome brand. That is a named forbiddenOutcome.
 *   - brand chrome under the monochrome tenant must carry no decorative hue.
 *
 * Both hold simultaneously only if status meaning rides a non-colour cue relay
 * — icon, label, rule, shape — with restrained colour on top. This scene exists
 * to show whether it does. The census recorded skeleton reading NOTHING and
 * spinner reading only type, so the loading vocabulary currently cannot follow
 * a tenant at all.
 */

import { Alert, Card, Heading, Skeleton, Spinner, Stack, Text } from '@rottay/design-system';

import { SceneFrame, SpecimenRow, Vignette, TORTURE_CONTENT } from '../../chrome';

export function FeedbackScene() {
  return (
    <SceneFrame title="feedback — alert + skeleton + spinner">
      {/* Status must survive grayscale. Judge this row with ?judge=grayscale:
          if the four severities become indistinguishable, meaning was carried
          by hue alone and the non-colour relay is missing. */}
      <SpecimenRow axis="status severity — must survive grayscale">
        <div style={{ minWidth: 260 }}>
          <Alert type="info" showIcon message="Period open" description="Twelve records await review." />
        </div>
        <div style={{ minWidth: 260 }}>
          <Alert type="success" showIcon message="Approved" description="The reconciliation was accepted." />
        </div>
        <div style={{ minWidth: 260 }}>
          <Alert type="warning" showIcon message="Closing soon" description="Two days remain in this period." />
        </div>
        <div style={{ minWidth: 260 }}>
          <Alert type="error" showIcon message="Rejected" description="A required approval is missing." />
        </div>
      </SpecimenRow>

      <SpecimenRow axis="alert — closable, no icon, long content">
        <div style={{ minWidth: 300 }}>
          <Alert type="info" closable message="Dismissable" description="Carries a close affordance." />
        </div>
        <div style={{ minWidth: 300 }}>
          <Alert type="warning" message="No icon" description={TORTURE_CONTENT.longLabel} />
        </div>
      </SpecimenRow>

      <SpecimenRow axis="loading — spinner scale">
        <Spinner size="sm" />
        <Spinner size="md" />
        <Spinner size="lg" />
      </SpecimenRow>

      {/* Skeleton is the family that reads nothing today. Its shimmer or pulse
          posture is a tenant-visible decision: a ledger should step, not glow. */}
      <SpecimenRow axis="loading — skeleton shape and activity">
        <div style={{ width: 260 }}>
          <Skeleton active title paragraph={{ rows: 3 }} />
        </div>
        <div style={{ width: 260 }}>
          <Skeleton active={false} title paragraph={{ rows: 2 }} />
        </div>
      </SpecimenRow>

      <Vignette label="loading panel">
        <Card title="Reconciliation" style={{ maxWidth: 520 }}>
          <Stack spacing="sm" fullWidth>
            <Skeleton active title paragraph={{ rows: 3 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Spinner size="sm" />
              <Text color="secondary" style={{ margin: 0 }}>
                Loading records
              </Text>
            </div>
          </Stack>
        </Card>
      </Vignette>

      <Vignette label="empty and error rhythm">
        <Stack spacing="sm" fullWidth>
          <Heading level="h3" style={{ margin: 0 }}>
            Nothing to review
          </Heading>
          <Text color="secondary" style={{ margin: 0 }}>
            {TORTURE_CONTENT.spanish}
          </Text>
          <div dir="rtl">
            <Alert type="error" showIcon message="خطأ" description={TORTURE_CONTENT.arabic} />
          </div>
        </Stack>
      </Vignette>
    </SceneFrame>
  );
}
