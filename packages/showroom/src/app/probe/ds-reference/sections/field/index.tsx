'use client';

/**
 * FIELD group scene — Input + Select + FormField.
 *
 * Same instrument shape as the control scene: grammar strip, state row,
 * composition vignette, content torture. The field group's specific question is
 * whether a field reads as the SAME family of decisions as a control — a field
 * is a control whose well is an inset surface, so its edge, focus treatment and
 * label posture must agree with Button's or the two groups are unrelated
 * styling rather than one grammar.
 */

import { useEffect, useRef } from 'react';
import { Button, FormField, Heading, Input, Select, Stack, Text } from '@rottay/design-system';

import { SceneFrame, SpecimenRow, Vignette, TORTURE_CONTENT } from '../../chrome';

const REGION_OPTIONS = [
  { label: 'North', value: 'north' },
  { label: 'South', value: 'south' },
  { label: 'East', value: 'east' },
  { label: 'West', value: 'west' },
];

/**
 * The mount-effect `.focus()` below is a best-effort convenience for a human
 * opening this route directly; it is NOT what the capture harness relies on.
 * An audit found it does not reliably survive to capture time (measured
 * `document.activeElement` as `body`, with a byte-identical border/box-shadow
 * to Rest), so `capture-lab.mjs` now takes real focus on
 * `[data-testid="lab-focused-field"]` itself, deterministically, after the
 * scene is confirmed painted, and proves it with three assertions before the
 * shutter. See the `FOCUS` contract there.
 */
function FocusedInput() {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);
  return <Input ref={ref} defaultValue="Focused" data-testid="lab-focused-field" />;
}

export function FieldScene() {
  return (
    <SceneFrame title="field — input + select + formfield">
      <SpecimenRow axis="field chrome">
        <Input placeholder="Placeholder" />
        <Input defaultValue="Filled value" />
        <Select placeholder="Select a region" options={REGION_OPTIONS} />
        <Select defaultValue="north" options={REGION_OPTIONS} />
      </SpecimenRow>

      <SpecimenRow axis="scale">
        <Input size="sm" placeholder="Small" />
        <Input size="md" placeholder="Medium" />
        <Input size="lg" placeholder="Large" />
      </SpecimenRow>

      {/* States. The focus treatment here must agree with the control group's:
          if a field focuses with a ring and a button focuses with a rule, the
          two groups are not one grammar. */}
      <SpecimenRow axis="states — rest, focus-visible, error, disabled">
        <Input defaultValue="Rest" data-testid="lab-focus-rest" />
        <FocusedInput />
        <Input defaultValue="Bad value" status="error" />
        <Input defaultValue="Disabled" disabled />
      </SpecimenRow>

      {/* FormField carries the label/help/error rhythm. Label posture is a
          shared axis with the control group's button labels. */}
      <SpecimenRow axis="formfield — label, required, help, error">
        <div style={{ minWidth: 240 }}>
          <FormField name="reviewer" label="Reviewer" help="Who signs off on this record.">
            <Input placeholder="Name" />
          </FormField>
        </div>
        <div style={{ minWidth: 240 }}>
          <FormField name="budgetCode" label="Budget code" required error="This field is required">
            <Input status="error" placeholder="Required" />
          </FormField>
        </div>
      </SpecimenRow>

      <Vignette label="form section">
        <Stack spacing="md" fullWidth>
          <Heading level="h2" style={{ margin: 0 }}>
            Record details
          </Heading>
          <Text color="secondary" style={{ margin: 0 }}>
            Fields are a page rhythm, not a stack of boxes. This section is judged on alignment,
            label cadence and the space between groups.
          </Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            <FormField name="title" label="Title" required>
              <Input defaultValue="Quarterly reconciliation" />
            </FormField>
            <FormField name="region" label="Region">
              <Select defaultValue="north" options={REGION_OPTIONS} />
            </FormField>
            <FormField name="owner" label="Owner" help="Defaults to the current reviewer.">
              <Input placeholder="Unassigned" />
            </FormField>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <Button variant="ghost">Cancel</Button>
            <Button variant="primary">Save record</Button>
          </div>
        </Stack>
      </Vignette>

      <SpecimenRow axis="content — long value, es, ar (RTL), unbroken token">
        <div style={{ width: 280 }}>
          <Input defaultValue={TORTURE_CONTENT.longLabel} />
        </div>
        <div style={{ width: 280 }}>
          <Input defaultValue={TORTURE_CONTENT.spanish} />
        </div>
        <div style={{ width: 280 }} dir="rtl">
          <Input defaultValue={TORTURE_CONTENT.arabic} />
        </div>
        <div style={{ width: 220 }}>
          <Input defaultValue={TORTURE_CONTENT.unbroken} />
        </div>
      </SpecimenRow>

      {/* ---- 5. Container-query proof ----
          Both boxes sit at the SAME viewport, side by side, and differ only in
          their own inline-size. `input.css` establishes `container-type:
          inline-size` on `.rottay-input-field[data-part='field']` (Input's own
          compound wrapper) and, at `@container (inline-size < 18rem)` (288px),
          resolves the affix's `min-inline-size` to a compact multiplier
          (`--ds-input-affix-size-compact`, distinct per-tenant from
          `--ds-input-affix-size` — 18px vs 22px in the BitHire artifact).
          400px sits above that line, 220px sits below it. A `prefix` is
          required to give both boxes a `[data-part="affix-prefix"]` element to
          measure at all — WITHOUT one, `--_ds-input-resolved-gap` looked like
          the obvious property to assert on instead, and it is genuinely set by
          this same `@container` rule, but a live measurement showed it staying
          IDENTICAL at both widths: `[data-size="md"]` carries its own
          higher-specificity `--_ds-input-resolved-gap` rule elsewhere in
          input.css that outranks the `@container` block regardless of which
          way the query evaluates, so that property can never move for a
          sized Input. Left as a real, disclosed product-CSS observation
          rather than quietly swapped for a target that "worked" without
          understanding why the first one did not. The affix rule carries no
          such per-size override (verified by grep), which is why it is the
          one this proof actually measures. */}
      <SpecimenRow axis="container query — independent of viewport (400px vs 220px)">
        <div data-testid="lab-container-probe-wide" style={{ width: 400 }}>
          <Input prefix="$" defaultValue="Wide container" />
        </div>
        <div data-testid="lab-container-probe-narrow" style={{ width: 220 }}>
          <Input prefix="$" defaultValue="Narrow container" />
        </div>
      </SpecimenRow>
    </SceneFrame>
  );
}
