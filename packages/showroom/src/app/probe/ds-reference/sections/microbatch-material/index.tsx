'use client';

import { HoverCard, Popconfirm, Slider, Spinner, Toast } from '@rottay/design-system';

import { SceneFrame, SpecimenRow } from '../../chrome';

export function MicrobatchMaterialScene() {
  return (
    <SceneFrame title="MICROBATCH MATERIAL - HOVERCARD + POPCONFIRM + SPINNER + SLIDER">
      <SpecimenRow axis="OVERLAY REGISTER - hovercard panel, popconfirm panel">
        <div data-testid="lab-hovercard">
          <HoverCard
            openDelay={0}
            closeDelay={100000}
            content={
              <div style={{ padding: 'var(--ds-spacing-2)' }}>
                Reviewer since 2024. Four open assignments.
              </div>
            }
            trigger={
              <button type="button" data-testid="lab-hovercard-trigger">
                Hover for reviewer
              </button>
            }
          />
        </div>

        <div data-testid="lab-popconfirm">
          <Popconfirm
            title="Archive this reviewer?"
            description="They will be removed from the active roster."
            okText="Archive"
            cancelText="Keep"
          >
            <button type="button" data-testid="lab-popconfirm-trigger">
              Click to archive
            </button>
          </Popconfirm>
        </div>
      </SpecimenRow>

      {/* Both overlay panels float below their triggers; this reserves their
          footprint so the control row is never occluded. */}
      <div aria-hidden="true" style={{ blockSize: 320 }} />

      <SpecimenRow axis="CONTROL REGISTER - spinner, slider thumb + tooltip">
        <div data-testid="lab-spinner">
          <Spinner size="lg" label="Loading roster" />
        </div>

        <div data-testid="lab-slider" style={{ inlineSize: 220 }}>
          <Slider defaultValue={45} min={0} max={100} tooltip={{ open: true }} />
        </div>
      </SpecimenRow>

      <SpecimenRow axis="TOAST SHADOW KNOB - data-shadow false must reach paint">
        <div data-testid="lab-toast-knob">
          <Toast visible variant="default" title="No shadow" description="data-shadow=false" shadow={false} />
        </div>
      </SpecimenRow>
    </SceneFrame>
  );
}
