'use client';

/**
 * CONTROL group scene — Button + Segmented.
 *
 * This is a JUDGEMENT INSTRUMENT, not a paint probe. The older torture probe
 * renders exhaustive variant x state matrices so a pixel-diff can catch a
 * channel regression; that is a different job. Here a sighted judge has to be
 * able to answer four questions at 320 / 390 / 768 / 1440:
 *
 *   1. is the family correct and premium
 *   2. does the GROUP read as one grammar (Button and Segmented agreeing)
 *   3. do the two tenants diverge on the named axes
 *   4. does it survive real content
 *
 * so the scene is ordered: grammar strip, state row, composition vignette,
 * content torture. Every string is hardcoded, product-free and tenant-free.
 */

import { useEffect, useRef } from 'react';
import { Button, Heading, Segmented, Stack, Text } from '@rottay/design-system';

import { SceneFrame, SpecimenRow, Vignette, TORTURE_CONTENT } from '../../chrome';

/**
 * Real programmatic focus, not a faked `:focus-visible` class.
 *
 * The mount-effect `.focus()` below is a best-effort convenience for a human
 * opening this route directly in a browser; it is NOT what the capture
 * harness relies on. An audit found this exact effect does not reliably
 * survive to capture time (the element measured as `document.body`, not
 * itself, with a byte-identical border/box-shadow to its Rest sibling), so
 * `capture-lab.mjs` now takes real focus on `[data-testid="lab-focused-control"]`
 * itself, deterministically, after the scene is confirmed painted, and proves
 * it with three assertions before the shutter. See the `FOCUS` contract there.
 */
function FocusedButton({ children }: { children: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return (
    <Button ref={ref} variant="secondary" data-testid="lab-focused-control">
      {children}
    </Button>
  );
}

export function ControlScene() {
  return (
    <SceneFrame title="control — button + segmented">
      {/* ---- 1. Grammar strip: the group's axes made visible ---- */}
      <SpecimenRow axis="action hierarchy">
        <Button variant="primary">Approve</Button>
        <Button variant="secondary">Assign</Button>
        <Button variant="outline">Compare</Button>
        <Button variant="ghost">Filter</Button>
        <Button variant="danger">Withdraw</Button>
        <Button variant="link">View details</Button>
      </SpecimenRow>

      <SpecimenRow axis="scale">
        <Button size="sm" variant="primary">
          Small
        </Button>
        <Button size="md" variant="primary">
          Medium
        </Button>
        <Button size="lg" variant="primary">
          Large
        </Button>
      </SpecimenRow>

      {/* Segmented at 2/3/5 options: the active segment is the group's primary
          treatment at small scale, so this is where Button and Segmented either
          agree on emphasis or visibly do not. */}
      <SpecimenRow axis="segmented — 2 / 3 / 5 options">
        <Segmented
          defaultValue="open"
          options={[
            { label: 'Open', value: 'open' },
            { label: 'Closed', value: 'closed' },
          ]}
        />
        <Segmented
          defaultValue="week"
          options={[
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
          ]}
        />
        <Segmented
          defaultValue="review"
          options={[
            { label: 'New', value: 'new' },
            { label: 'Screen', value: 'screen' },
            { label: 'Review', value: 'review' },
            { label: 'Offer', value: 'offer' },
            { label: 'Closed', value: 'closed2' },
          ]}
        />
      </SpecimenRow>

      {/* Joinery: a fused cluster is where adjacency, shared edges and radius
          nesting are observable. A group that only looks right when spaced is
          not a grammar. */}
      <SpecimenRow axis="joinery — fused vs gapped">
        <Button.Group connected>
          <Button variant="outline">Day</Button>
          <Button variant="outline">Week</Button>
          <Button variant="outline">Month</Button>
        </Button.Group>
        <Button.Group>
          <Button variant="outline">Export</Button>
          <Button variant="outline">Share</Button>
        </Button.Group>
      </SpecimenRow>

      {/* ---- 2. State row ---- */}
      <SpecimenRow axis="states — rest, focus-visible, disabled, busy">
        <Button variant="secondary" data-testid="lab-focus-rest">
          Rest
        </Button>
        <FocusedButton>Focused</FocusedButton>
        <Button variant="secondary" disabled>
          Disabled
        </Button>
        <Button variant="primary" loading>
          Saving
        </Button>
        <Button variant="primary" pending pendingLabel="Submitting">
          Submit
        </Button>
      </SpecimenRow>

      {/* ---- 3. Composition vignette: the group doing real work ---- */}
      <Vignette label="action bar">
        <Stack spacing="sm" fullWidth>
          <Heading level="h2" style={{ margin: 0 }}>
            Quarterly review
          </Heading>
          <Text color="secondary" style={{ margin: 0 }}>
            Twelve items are awaiting a decision before the period closes.
          </Text>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              paddingTop: 8,
            }}
          >
            <Segmented
              defaultValue="pending"
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
                { label: 'All', value: 'all' },
              ]}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="ghost">Cancel</Button>
              <Button variant="outline">Save draft</Button>
              <Button variant="primary">Approve all</Button>
            </div>
          </div>
        </Stack>
      </Vignette>

      {/* ---- 4. Content torture ---- */}
      {/* Content torture, with the INSTRUMENT bounded rather than the test weakened.
          A numeric maxWidth (320) is not bounded by the row that contains it, so at a
          280 or 320 viewport the RTL button reached right=332 and the document
          scrolled — an overflow caused by the lab, not by Button. Each specimen now
          sits in a block that can shrink (minInlineSize 0) and is capped relative to
          its container (maxInlineSize 100%), which stresses the same long, Spanish,
          Arabic-RTL and unbroken content without manufacturing a false positive. */}
      <SpecimenRow axis="content — long label, es, ar (RTL), unbroken token">
        <div style={{ minInlineSize: 0, maxInlineSize: 'min(320px, 100%)' }}>
          <Button variant="outline" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.longLabel}
          </Button>
        </div>
        <div style={{ minInlineSize: 0, maxInlineSize: 'min(320px, 100%)' }}>
          <Button variant="outline" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.spanish}
          </Button>
        </div>
        <div dir="rtl" lang="ar" style={{ minInlineSize: 0, maxInlineSize: 'min(320px, 100%)' }}>
          <Button variant="outline" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.arabic}
          </Button>
        </div>
        <div style={{ minInlineSize: 0, maxInlineSize: 'min(240px, 100%)' }}>
          <Button variant="outline" style={{ maxInlineSize: '100%' }}>
            {TORTURE_CONTENT.unbroken}
          </Button>
        </div>
      </SpecimenRow>
    </SceneFrame>
  );
}
