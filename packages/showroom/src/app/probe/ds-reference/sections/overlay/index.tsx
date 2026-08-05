'use client';

/**
 * OVERLAY group scene — Modal + Drawer + Popover + Dropdown.
 *
 * The overlay group's specific question is whether four families paint ONE
 * panel ground. The census recorded popover reading ten surface-role channels
 * while drawer and dropdown read none, so before the Cohort 1 adoption these
 * four authored the same ground four different ways.
 *
 * Overlays are rendered OPEN by default: a closed overlay photographs nothing,
 * and the scrim, panel material, edge and depth are exactly what has to be
 * judged. They are laid out in a grid rather than stacked so all four are
 * visible in one capture without covering each other.
 */

import { Button, Drawer, Dropdown, Heading, Modal, Popover, Stack, Text } from '@rottay/design-system';

import { SceneFrame, SpecimenRow, Vignette, TORTURE_CONTENT } from '../../chrome';

const MENU_ITEMS = [
  { key: 'open', label: 'Open record' },
  { key: 'assign', label: 'Assign reviewer' },
  { key: 'export', label: 'Export as CSV' },
  { key: 'archive', label: 'Archive' },
];

export function OverlayScene({ layer = 'contextual' }: { layer?: 'contextual' | 'blocking' | 'drawer-only' }) {
  // SCENE SEPARATION. A modal scrim covers the whole viewport, so rendering the
  // blocking chamber in the same frame as the contextual overlays hid popover
  // and dropdown entirely and made half the group unjudgeable. The group is one
  // grammar but it is not one PICTURE: contextual and blocking layers are
  // captured separately so each is actually visible.
  const contextual = layer === 'contextual';
  const blocking = layer === 'blocking';
  // DRAWER-ONLY CHAMBER. Measured, not assumed: the modal's <dialog data-part="root">
  // spans the full viewport (0,0 to 100%/100%) as its own backdrop/stacking
  // context at every captured width from 320 to 1440, so whenever both panels
  // are open together the drawer (z1400) sits entirely BEHIND the modal
  // (z1500+) and contributes nothing to the combined 'blocking' image — that
  // capture proves the two CAN coexist without breaking layout, but it cannot
  // be the only evidence for the drawer's own edge, surface and content. This
  // third mode opens the Drawer alone so it is not merely present in the DOM
  // but genuinely unoccluded in the picture.
  const drawerOnly = layer === 'drawer-only';
  const showDrawer = blocking || drawerOnly;
  return (
    <SceneFrame
      title={
        contextual
          ? 'overlay — popover + dropdown (contextual layer)'
          : blocking
            ? 'overlay — modal + drawer (blocking layer)'
            : 'overlay — drawer (isolated chamber, unoccluded)'
      }
    >
      {/* Inline, always-open contextual overlays. These two are the ones the
          census showed diverging most: popover consumed the role vocabulary,
          dropdown consumed none. */}
      {contextual ? (<SpecimenRow axis="contextual — popover">
        <Popover
          open
          title="Reviewer"
          content={
            <div style={{ maxWidth: 240 }}>
              <Text style={{ margin: 0 }}>Assigned two days ago. Decision due before the period closes.</Text>
            </div>
          }
        >
          {/* Real-focus target for this scene: harness-forced focus is asserted
              against `lab-focus-rest` (the Dropdown anchor below), both being
              the same `Button variant="outline"` so the comparison isolates
              the focus-only delta rather than two dissimilar controls. */}
          <Button variant="outline" data-testid="lab-focus-target">
            Anchor
          </Button>
        </Popover>

      </SpecimenRow>) : null}

      {/* Each contextual overlay gets its own band with reserved height: both
          render OPEN, and open panels are absolutely positioned, so sharing a row
          made them collide with each other and with the following text. Reserving
          the space is what makes each panel independently judgeable. */}
      {contextual ? (<div style={{ minBlockSize: 190 }} />) : null}

      {contextual ? (<SpecimenRow axis="contextual — dropdown">
        <Dropdown open menu={{ items: MENU_ITEMS }}>
          <Button variant="outline" data-testid="lab-focus-rest">
            Actions
          </Button>
        </Dropdown>
      </SpecimenRow>) : null}

      {contextual ? (<div style={{ minBlockSize: 210 }} />) : null}

      {/* Blocking chamber and edge panel. Both carry a scrim, which is the one
          veil authority (--ds-overlay-scrim) and must never be hand-rolled. */}
      {blocking ? (<SpecimenRow axis="blocking — modal">
        <Modal open title="Approve reconciliation" onClose={() => undefined}>
          <Stack spacing="sm" fullWidth>
            <Text style={{ margin: 0 }}>
              Twelve records will be approved and the period will be closed. This cannot be undone
              from this screen.
            </Text>
            <Text color="secondary" style={{ margin: 0 }}>
              {TORTURE_CONTENT.longLabel}
            </Text>
            {/* Real-focus pair for this scene: Approve is harness-focused and
                asserted against Cancel (`lab-focus-rest`) sitting right beside
                it — both plain Buttons inside the modal's own elevated
                stacking context, so the check also proves the focus ring is
                not clipped or repainted differently by the dialog surface. */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 8 }}>
              <Button variant="ghost" data-testid="lab-focus-rest">
                Cancel
              </Button>
              <Button variant="primary" data-testid="lab-focus-target">
                Approve
              </Button>
            </div>
          </Stack>
        </Modal>
      </SpecimenRow>) : null}

      {showDrawer ? (<SpecimenRow axis="edge panel — drawer">
        <Drawer open placement="right" title="Record detail" onClose={() => undefined}>
          <Stack spacing="sm" fullWidth>
            <Heading level="h3" style={{ margin: 0 }}>
              Quarterly reconciliation
            </Heading>
            <Text color="secondary" style={{ margin: 0 }}>
              {TORTURE_CONTENT.spanish}
            </Text>
            <div dir="rtl">
              <Text style={{ margin: 0 }}>{TORTURE_CONTENT.arabic}</Text>
            </div>
            <Text style={{ margin: 0, wordBreak: 'break-word' }}>{TORTURE_CONTENT.unbroken}</Text>
          </Stack>
        </Drawer>
      </SpecimenRow>) : null}

      <Vignette label="layered stack — dropdown over panel">
        <Text color="secondary" style={{ margin: 0 }}>
          Elevation stratigraphy is judged here: a contextual overlay opened over a blocking one
          must read as one step above it, not as a second unrelated material.
        </Text>
      </Vignette>
    </SceneFrame>
  );
}
