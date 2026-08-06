'use client';

/**
 * DISPLAY — SURFACES scene — Card + Callout + Empty + Descriptions + Statistic.
 *
 * Five families grouped because each one is a bounded, self-contained block
 * of summarized content — the DS's "here is a fact, a message, or a state"
 * vocabulary, as opposed to `display-collections` (repeating rows of many
 * facts) or `display-labels` (annotating something else). Same instrument
 * shape as every other scene: each family gets a realistic grammar row and a
 * long-content row, closing with a composition vignette that assembles
 * several of them into one record panel the way a real detail screen would.
 *
 * READINESS MARKERS. Same technique as `display-labels`: each family's
 * primary specimen is wrapped in a plain `data-testid="lab-display-<family>"`
 * span/div this scene owns, so `capture-lab.mjs` READINESS['display-surfaces']
 * does not depend on any engine's internal DOM/class names while those are
 * being rewritten concurrently by other lanes.
 */

import { Button, Callout, Card, Descriptions, Empty, Statistic } from '@rottay/design-system';

import { SceneFrame, SpecimenRow, TORTURE_CONTENT, Vignette } from '../../chrome';

export function DisplaySurfacesScene() {
  return (
    <SceneFrame title="display — surfaces: card + callout + empty + descriptions + statistic">
      {/* ---- Card ---- */}
      <SpecimenRow axis="card — variants, header/body/footer compound">
        <div data-testid="lab-display-card" style={{ minInlineSize: 280, maxInlineSize: 360 }}>
          <Card variant="elevated" padding="md">
            <Card.Header title="Quarterly reconciliation" subtitle="Finance • Q3 2026" />
            <Card.Body>Twelve records were reviewed against the published ledger.</Card.Body>
            <Card.Footer actions={[<Button key="view" variant="outline">View</Button>, <Button key="approve" variant="primary">Approve</Button>]} />
          </Card>
        </div>
      </SpecimenRow>
      <SpecimenRow axis="card — outlined, filled, ghost">
        <div style={{ minInlineSize: 200, maxInlineSize: 260 }}>
          <Card variant="outlined" padding="sm">
            <Card.Body>Outlined surface</Card.Body>
          </Card>
        </div>
        <div style={{ minInlineSize: 200, maxInlineSize: 260 }}>
          <Card variant="filled" padding="sm">
            <Card.Body>Filled surface</Card.Body>
          </Card>
        </div>
        <div style={{ minInlineSize: 200, maxInlineSize: 260 }}>
          <Card variant="ghost" padding="sm">
            <Card.Body>Ghost surface</Card.Body>
          </Card>
        </div>
      </SpecimenRow>
      <SpecimenRow axis="card — long content">
        <div style={{ minInlineSize: 260, maxInlineSize: 340 }}>
          <Card variant="outlined" padding="md">
            <Card.Header title={TORTURE_CONTENT.longLabel} />
            <Card.Body>{TORTURE_CONTENT.longParagraph}</Card.Body>
          </Card>
        </div>
      </SpecimenRow>

      {/* ---- Callout ---- */}
      <SpecimenRow axis="callout — tone strip, closable, title">
        <div style={{ minInlineSize: 260 }}>
          <div data-testid="lab-display-callout" style={{ display: 'block' }}>
            <Callout tone="info" title="Period open">
              Twelve records await review before the period closes.
            </Callout>
          </div>
        </div>
        <div style={{ minInlineSize: 260 }}>
          <Callout tone="success" title="Approved">
            The reconciliation was accepted.
          </Callout>
        </div>
        <div style={{ minInlineSize: 260 }}>
          <Callout tone="warning" title="Closing soon" closable onClose={() => undefined}>
            Two days remain in this period.
          </Callout>
        </div>
        <div style={{ minInlineSize: 260 }}>
          <Callout tone="danger" title="Rejected" action={<Button variant="ghost">Resubmit</Button>}>
            A required approval is missing.
          </Callout>
        </div>
      </SpecimenRow>
      <SpecimenRow axis="callout — long content, ar (RTL)">
        <div style={{ minInlineSize: 260, maxInlineSize: 380 }}>
          <Callout tone="warning" title={TORTURE_CONTENT.longLabel}>
            {TORTURE_CONTENT.longParagraph}
          </Callout>
        </div>
        <div dir="rtl" lang="ar" style={{ minInlineSize: 260, maxInlineSize: 380 }}>
          <Callout tone="danger" title="خطأ">
            {TORTURE_CONTENT.arabic}
          </Callout>
        </div>
      </SpecimenRow>

      {/* ---- Empty ---- */}
      <SpecimenRow axis="empty — default and simple image, action">
        <div data-testid="lab-display-empty" style={{ minInlineSize: 220 }}>
          <Empty description="Your queue is empty">
            <Button variant="outline">Start review</Button>
          </Empty>
        </div>
        <div style={{ minInlineSize: 220 }}>
          <Empty image="simple" description="No matching records" />
        </div>
      </SpecimenRow>
      <SpecimenRow axis="empty — long content">
        <div style={{ minInlineSize: 260, maxInlineSize: 340 }}>
          <Empty description={TORTURE_CONTENT.longParagraph} />
        </div>
      </SpecimenRow>

      {/* ---- Descriptions ---- */}
      <SpecimenRow axis="descriptions — title, bordered, 2-column grid">
        <div data-testid="lab-display-descriptions" style={{ minInlineSize: 320, maxInlineSize: 480 }}>
          <Descriptions title="Record detail" column={2} bordered>
            <Descriptions.Item label="Reviewer">Jane Doe</Descriptions.Item>
            <Descriptions.Item label="Status">Pending</Descriptions.Item>
            <Descriptions.Item label="Budget code">FIN-2026-Q3</Descriptions.Item>
            <Descriptions.Item label="Submitted">2026-07-02</Descriptions.Item>
            <Descriptions.Item label="Notes" span={2}>
              Awaiting a second approval before the period closes.
            </Descriptions.Item>
          </Descriptions>
        </div>
      </SpecimenRow>
      <SpecimenRow axis="descriptions — long value, ar (RTL), unbroken token">
        <div style={{ minInlineSize: 280, maxInlineSize: 420 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Summary">{TORTURE_CONTENT.longParagraph}</Descriptions.Item>
            <Descriptions.Item label="Reference">{TORTURE_CONTENT.unbroken}</Descriptions.Item>
            <Descriptions.Item label="ملاحظة">
              <span dir="rtl" lang="ar">
                {TORTURE_CONTENT.arabic}
              </span>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </SpecimenRow>

      {/* ---- Statistic ---- */}
      <SpecimenRow axis="statistic — prefix/suffix, precision, valueType, countdown">
        <div data-testid="lab-display-statistic" style={{ display: 'inline-flex' }}>
          <Statistic title="Revenue" value={1250000} prefix="$" precision={2} />
        </div>
        <Statistic title="Growth" value={15.5} suffix="%" valueType="positive" />
        <Statistic title="Churn" value={-3.2} suffix="%" valueType="negative" />
        <Statistic title="Overdue" value={4} valueType="warning" />
        <Statistic.Countdown title="Period closes in" value={Date.now() + 3600000} format="HH:mm:ss" />
      </SpecimenRow>
      <SpecimenRow axis="statistic — long title">
        <Statistic title={TORTURE_CONTENT.longLabel} value={1234567} precision={0} />
      </SpecimenRow>

      {/* ---- Composition vignette ---- */}
      <Vignette label="record summary panel">
        <div style={{ maxInlineSize: 460 }}>
          <Card variant="elevated" padding="md">
            <Card.Header title="Quarterly reconciliation" subtitle="Finance • Q3 2026" />
            <Card.Body>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBlockEnd: 16 }}>
                <Statistic title="Approved" value={8} valueType="positive" />
                <Statistic title="Pending" value={3} valueType="warning" />
                <Statistic title="Rejected" value={1} valueType="negative" />
              </div>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Reviewer">Jane Doe</Descriptions.Item>
                <Descriptions.Item label="Due">2026-08-15</Descriptions.Item>
              </Descriptions>
              <div style={{ marginBlockStart: 16 }}>
                <Callout tone="warning" title="Closing soon">
                  Two days remain in this period.
                </Callout>
              </div>
            </Card.Body>
            <Card.Footer actions={[<Button key="approve" variant="primary">Approve all</Button>]} />
          </Card>
        </div>
      </Vignette>
    </SceneFrame>
  );
}
