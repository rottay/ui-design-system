/**
 * K4-C Pass 2 STATIC specimen renderer (scratch — deleted after use).
 * Renders the real modern engines to static HTML cells with the real served
 * CSS (dist/platform.css) + the real tenant CSS (same compiler chain the
 * provider uses), so the sighted review runs against faithful paint without
 * needing the dev server. Cells written to pass2/specimens/*.html.
 */
import React from 'react';
import { renderToString } from 'react-dom/server';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it } from 'vitest';

import ModernCarousel from '@/ui/primitives/display/Carousel/engines/modern';
import ModernImage from '@/ui/primitives/display/Image/engines/modern';
import ModernQRCode from '@/ui/primitives/display/QRCode/engines/modern';
import { ColorPicker as ModernColorPicker } from '@/ui/primitives/inputs/ColorPicker/engines/modern';
import {
  FloatButton as ModernFloatButton,
  Group as ModernFloatButtonGroup,
} from '@/ui/primitives/navigation/FloatButton/engines/modern';
import { Watermark as ModernWatermark } from '@/ui/primitives/overlay/Watermark/engines/modern';
import {
  resolveTenantVisualConfig,
  generateTenantCssFromResolvedVisualConfig,
} from '@/infrastructure/compilers/runtime/tenant-css/visual-config';
import { brandThemeToTenantAppearance } from '@/ui/patterns/customization/brand-studio/runtime/file-export';
import { bithireBrandTheme } from '@/foundation/tokens/ts/presentation/brand-themes/bithire';
import { themanagementmiamiBrandTheme } from '/Users/daniel/Developer/Rottay/ui-design-system/packages/showroom/src/components/torture-surface/fixtures/themanagementmiami/index';
import type { TenantConfig } from '@/foundation/contracts';

const OUT = '/Users/daniel/Developer/Rottay/ui-design-system/test-artifacts/rottay-design-platform/K4/k4-lane-c/pass2/specimens';
const CORE = '/Users/daniel/Developer/Rottay/ui-design-system/packages/core';
const platformCss = readFileSync(`${CORE}/dist/platform.css`, 'utf8');
// dist is rebuilt only by the coordinator; append CURRENT family skin/token
// sources after it so the static cells render this lane's latest source state
// (same rules, later source order wins at equal specificity).
const SKIN_DIR = `${CORE}/src/foundation/tokens/css/runtime/engines/modern/skin`;
const currentFamilyCss = [
  'carousel.css', 'image.css', 'qrcode.css', 'color-picker.css', 'float-button.css', 'watermark.css',
]
  .map((f) => readFileSync(`${SKIN_DIR}/${f}`, 'utf8'))
  .join('\n') + '\n' + readFileSync(
    `${CORE}/src/foundation/tokens/css/presentation/components/qrcode.css`,
    'utf8',
  );

type Density = 'compact' | 'comfortable' | 'spacious';

function tenantCss(source: 'bithire-static' | 'themanagement-db', density: Density): string {
  const d = density === 'comfortable' ? 'normal' : density;
  const config = (
    source === 'bithire-static'
      ? {
          slug: 'bithire', name: 'BitHire', vertical: 'bithire', engine: 'modern', theme: 'light',
          plan: 'enterprise', features: ['*'], branding: { companyName: 'BitHire' },
          brandTheme: bithireBrandTheme,
          appearance: { general: { density: d } },
        }
      : {
          slug: 'themanagementmiami', name: 'The Management Miami', vertical: 'bithire', engine: 'modern', theme: 'light',
          plan: 'enterprise', features: ['*'], branding: { companyName: 'The Management Miami' },
          appearance: {
            ...brandThemeToTenantAppearance(themanagementmiamiBrandTheme),
            general: { ...brandThemeToTenantAppearance(themanagementmiamiBrandTheme).general, density: d },
          },
        }
  ) as unknown as TenantConfig;
  const resolved = resolveTenantVisualConfig(config as never);
  return generateTenantCssFromResolvedVisualConfig(resolved as never, {
    includeDarkSelector: false,
    includeSystemDarkSelector: false,
  } as never);
}

const SLIDES = ['var(--ds-color-primary)', 'var(--ds-color-secondary)', 'var(--ds-color-success)'];
const VALID_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%237c9cbf'/%3E%3C/svg%3E";
const BROKEN_IMG = '/__k4c_missing__.png';

function SlideCells() {
  // Array, NOT a fragment: React.Children.toArray does not traverse fragments,
  // so a fragment child collapses the carousel to one slide (Pass-2 finding).
  return SLIDES.map((background, i) => (
    <div
      key={background}
      style={{
        background, width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', color: 'var(--ds-color-white)',
      }}
    >
      Slide {i + 1}
    </div>
  ));
}

function Specimen({ state }: { state: 'rest' | 'loading' | 'error' }) {
  const leadQr = state === 'loading' ? 'loading' : state === 'error' ? 'expired' : 'active';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <div data-testid="k4c-carousel">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div data-testid="k4c-carousel-horizontal" style={{ position: 'relative', width: 280, height: 120 }}>
            <ModernCarousel arrows dots style={{ height: 120 }}>{SlideCells()}</ModernCarousel>
          </div>
          <div data-testid="k4c-carousel-vertical" style={{ position: 'relative', width: 140, height: 120 }}>
            <ModernCarousel arrows dots vertical style={{ height: 120 }}>{SlideCells()}</ModernCarousel>
          </div>
          <div data-testid="k4c-carousel-fade" style={{ position: 'relative', width: 140, height: 120 }}>
            <ModernCarousel dots fade style={{ height: 120 }}>{SlideCells()}</ModernCarousel>
          </div>
        </div>
      </div>

      <div data-testid="k4c-image">
        <div style={{ display: 'flex', gap: 8 }}>
          <ModernImage src={VALID_IMG} alt="Loaded" width={64} height={64} bordered shadow />
          <ModernImage src="" alt="Loading" width={64} height={64} />
          <ModernImage src={BROKEN_IMG} alt="Errored" width={64} height={64} />
          <ModernImage src={VALID_IMG} alt="Zoomable" width={64} height={64} zoomable hoverOverlay={<span>View</span>} />
        </div>
      </div>

      <div data-testid="k4c-qrcode">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <ModernQRCode type="svg" value="https://rottay.com/k4c" size={96} bordered status={leadQr} onRefresh={leadQr === 'expired' ? () => undefined : undefined} />
          <ModernQRCode type="svg" value="https://rottay.com/k4c" size={96} status="loading" />
          <ModernQRCode type="svg" value="https://rottay.com/k4c" size={96} status="expired" onRefresh={() => undefined} />
          <ModernQRCode type="svg" value="https://rottay.com/k4c" size={96} status="scanned" />
        </div>
      </div>

      <div data-testid="k4c-colorpicker">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div data-testid="k4c-colorpicker-token">
            <ModernColorPicker showText onChange={() => undefined} />
          </div>
          <ModernColorPicker
            open
            defaultValue="#2a7d4f"
            presets={[{ label: 'Brand', colors: ['#1677ff', '#52c41a', '#faad14'] }]}
            allowClear
            onChange={() => undefined}
          />
          <ModernColorPicker disabled defaultValue="#52c41a" onChange={() => undefined} />
        </div>
      </div>

      <div data-testid="k4c-floatbutton">
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div data-testid="k4c-floatbutton-variants" style={{ display: 'flex', gap: 12, position: 'relative' }}>
            <ModernFloatButton icon={<span aria-hidden="true">+</span>} type="default" badge={{ count: 3 }} style={{ position: 'static' }} />
            <ModernFloatButton icon={<span aria-hidden="true">+</span>} type="primary" shape="circle" badge={{ dot: true }} style={{ position: 'static' }} />
            <ModernFloatButton description="Square" type="default" shape="square" badge={{ count: 128 }} style={{ position: 'static' }} />
          </div>
          <div data-testid="k4c-floatbutton-group">
            <ModernFloatButtonGroup open trigger="click" icon={<span aria-hidden="true">?</span>} style={{ position: 'static' }}>
              <ModernFloatButton icon={<span aria-hidden="true">a</span>} style={{ position: 'static' }} />
              <ModernFloatButton icon={<span aria-hidden="true">b</span>} style={{ position: 'static' }} />
            </ModernFloatButtonGroup>
          </div>
        </div>
      </div>

      <div data-testid="k4c-watermark">
        <ModernWatermark content="K4C Draft">
          <div style={{ padding: 24, minHeight: 80, background: 'var(--ds-color-bg-primary)' }}>
            Watermarked content
          </div>
        </ModernWatermark>
      </div>
    </div>
  );
}

function cellHtml(source: string, dir: 'ltr' | 'rtl', tenantCssText: string, body: string): string {
  const slug = source === 'themanagement-db' ? 'themanagementmiami' : 'bithire';
  return `<!doctype html>
<html data-tenant="${slug}" data-theme="light" dir="${dir}">
<head><meta charset="utf-8"><style>${platformCss}</style><style>${currentFamilyCss}</style><style>${tenantCssText}</style></head>
<body style="margin:0;background:var(--ds-color-background);color:var(--ds-color-text-primary);font-family:var(--ds-font-family-base)">
<div data-testid="k4c-frame" dir="${dir}" style="padding:24px;max-width:880px;margin-inline:auto">${body}</div>
<script>/* Static-harness mirror of the ColorPicker engine's edge-detection effect
   (K4-C Pass 2): the SSR markup is not hydrated, so this vanilla stand-in runs
   the same measurement the engine effect performs on open. */
document.querySelectorAll('[data-part="dropdown"]').forEach(function (d) {
  var r = d.getBoundingClientRect();
  if (r.right > window.innerWidth - 8) { d.setAttribute('data-edge', 'end'); d.classList.add('end-0'); }
  else { d.setAttribute('data-edge', 'start'); }
});
</script>
</body></html>`;
}

describe('K4-C pass2 static specimens', () => {
  it('renders all cells', () => {
    mkdirSync(OUT, { recursive: true });
    const sources = ['bithire-static', 'themanagement-db'] as const;
    const densities: Density[] = ['compact', 'comfortable', 'spacious'];
    for (const source of sources) {
      for (const density of densities) {
        const css = tenantCss(source, density);
        for (const dir of ['ltr', 'rtl'] as const) {
          for (const state of ['rest', 'error'] as const) {
            const body = renderToString(<Specimen state={state} />);
            const name = `${source}-${density}-${dir}-${state}.html`;
            writeFileSync(resolve(OUT, name), cellHtml(source, dir, css, body));
          }
        }
      }
    }
    console.log('specimens written to', OUT);
  });
});
