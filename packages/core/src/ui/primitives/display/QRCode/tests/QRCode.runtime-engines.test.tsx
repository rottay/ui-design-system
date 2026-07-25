import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernQRCode from '../engines/modern';
import RusticQRCode from '../engines/rustic';
import { renderWithEngine } from '@/tooling/testing/helpers/engine';

const REAL_ENGINES = [
  ['modern', ModernQRCode],
  ['rustic', RusticQRCode],
] as const;

afterEach(() => {
  vi.restoreAllMocks();
});

describe.each(REAL_ENGINES)('%s QRCode runtime', (_name, RuntimeQRCode) => {
  it('renders the real encoded SVG and changes its matrix with error correction', () => {
    const { container, rerender } = render(
      <RuntimeQRCode
        value="https://example.com/candidate/42"
        type="svg"
        errorLevel="L"
      />,
    );

    const lowHost = container.querySelector('[data-part="canvas"]');
    const lowSymbol = lowHost?.querySelector('svg');
    const lowPath = lowSymbol?.querySelectorAll('path')[1]?.getAttribute('d');
    expect(lowSymbol).not.toBeNull();
    expect(lowPath).toMatch(/^M/);
    expect(lowHost).toHaveAttribute('data-qr-error-level', 'L');
    expect(container.querySelector('canvas')).toBeNull();

    rerender(
      <RuntimeQRCode
        value="https://example.com/candidate/42"
        type="svg"
        errorLevel="H"
      />,
    );

    const highHost = container.querySelector('[data-part="canvas"]');
    const highSymbol = highHost?.querySelector('svg');
    const highPath = highSymbol?.querySelectorAll('path')[1]?.getAttribute('d');
    expect(highHost).toHaveAttribute('data-qr-error-level', 'H');
    expect(highPath).toMatch(/^M/);
    expect(highPath).not.toBe(lowPath);
  });

  it('honors canvas output and exposes the encoded value as its accessible name', () => {
    const { container } = render(
      <RuntimeQRCode value="tenant invitation 9281" type="canvas" errorLevel="Q" />,
    );

    const canvas = screen.getByRole('img', {
      name: 'QR code containing: tenant invitation 9281',
    });
    expect(canvas.tagName).toBe('CANVAS');
    const host = canvas.closest('[data-part="canvas"]');
    expect(host).toHaveAttribute('data-qr-render-type', 'canvas');
    expect(host).toHaveAttribute('data-qr-error-level', 'Q');
    expect(container.querySelector('svg')).toBeNull();
  });

  it('resolves CSS-variable paint against each local provider root', async () => {
    const { container } = render(
      <div>
        <section data-testid="first-provider">
          <RuntimeQRCode
            value="first"
            type="svg"
            color="var(--qr-foreground)"
            bgColor="var(--qr-background)"
          />
        </section>
        <section data-testid="second-provider">
          <RuntimeQRCode
            value="second"
            type="svg"
            color="var(--qr-foreground)"
            bgColor="var(--qr-background)"
          />
        </section>
      </div>,
    );

    const owners = container.querySelectorAll('[data-part="canvas-wrapper"]');
    (owners[0] as HTMLElement).style.setProperty('--qr-foreground', '#123456');
    (owners[0] as HTMLElement).style.setProperty('--qr-background', '#f4f5f6');
    (owners[0] as HTMLElement).setAttribute('data-theme', 'first-local');
    (owners[1] as HTMLElement).style.setProperty('--qr-foreground', '#a12b3c');
    (owners[1] as HTMLElement).style.setProperty('--qr-background', '#fff7e6');
    (owners[1] as HTMLElement).setAttribute('data-theme', 'second-local');

    await waitFor(() => {
      const symbols = container.querySelectorAll('[data-part="canvas"] svg');
      expect(symbols[0]?.querySelectorAll('path')[0]).toHaveAttribute('fill', '#f4f5f6');
      expect(symbols[0]?.querySelectorAll('path')[1]).toHaveAttribute('fill', '#123456');
      expect(symbols[1]?.querySelectorAll('path')[0]).toHaveAttribute('fill', '#fff7e6');
      expect(symbols[1]?.querySelectorAll('path')[1]).toHaveAttribute('fill', '#a12b3c');
    });
  });
});

describe('modern QRCode chrome (K4-C)', () => {
  // happy-dom drops var() on standard properties, so token bindings are
  // asserted against the skin source (the single paint owner) while the DOM
  // assertions pin what the engine no longer writes inline.
  const modernSkin = readFileSync(
    resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/qrcode.css'),
    'utf8',
  );

  it('consolidates spinner/refresh-button/icon geometry into the skin with verbatim fallbacks', () => {
    expect(modernSkin).toContain('--ds-qrcode-spinner-size, 24px');
    expect(modernSkin).toContain('--ds-qrcode-refresh-button-size, 32px');
    expect(modernSkin).toContain('--ds-qrcode-refresh-button-padding-x, 12px');
    expect(modernSkin).toContain('--ds-qrcode-refresh-button-font-size, 13px');
    expect(modernSkin).toContain('--ds-qrcode-icon-padding, 4px');
    expect(modernSkin).toContain('ds-foundation-spin');
  });

  it('pins the expired-state contrast model (K4-C round 2, axe remediation)', () => {
    // Root cause was chrome OPACITY, not ink: the bridge muted the root and
    // the engine repeated it inline on the overlay. The skin countermands the
    // bridge per status and mutes only the canvas (Pass 2 extended the same
    // treatment to the loading spinner and scanned check, equally ghosted).
    expect(modernSkin).toContain(".rottay-qrcode.rottay-qrcode--modern[data-status='expired'][data-status='expired'] {\n  opacity: 1;");
    expect(modernSkin).toContain(".rottay-qrcode.rottay-qrcode--modern[data-status='loading'][data-status='loading'] {\n  opacity: 1;");
    expect(modernSkin).toContain(".rottay-qrcode.rottay-qrcode--modern[data-status='scanned'][data-status='scanned'] {\n  opacity: 1;");
    expect(modernSkin).toContain("[data-part='canvas'] {\n  opacity: var(--ds-qrcode-status-expired-opacity, 0.3);");
    expect(modernSkin).toContain("[data-part='canvas'] {\n  opacity: var(--ds-qrcode-loading-opacity, 0.5);");
    expect(modernSkin).toContain("[data-part='canvas'] {\n  opacity: var(--ds-qrcode-status-scanned-opacity, 0.7);");
    // The round-1 ink mix is REVERTED: the declared solid-chip pair
    // (white on primary, 5.15/5.47) stands on its own.
    expect(modernSkin).not.toContain('--ds-qrcode-refresh-button-ink');
    expect(modernSkin).toContain('color: var(--ds-qrcode-refresh-button-color, var(--ds-color-primary));');
    expect(modernSkin).toContain('background: var(--ds-qrcode-refresh-button-bg, transparent);');
    // The component token file deepened the expired scrim 0.5 -> 0.6 so the
    // white status text clears AA on both sources at full chrome opacity.
    const componentTokens = readFileSync(
      resolve(__dirname, '../../../../../foundation/tokens/css/presentation/components/qrcode.css'),
      'utf8',
    );
    expect(componentTokens).toContain('--ds-qrcode-status-expired-overlay-bg: rgba(0, 0, 0, 0.6);');
    // Pass 2: the control never shrinks on tiny QRs (flex-shrink ate the
    // 32px button down to 26.5px on a 72px cell), and the radius is a
    // stadium pill instead of a 50% ellipse on the wide button.
    expect(componentTokens).toContain('--ds-qrcode-refresh-button-radius: var(--ds-radius-full, 9999px);');
    expect(modernSkin).toContain('flex-shrink: 0;');
  });

  it('writes no inline chrome geometry or opacity — only runtime arithmetic stays inline', () => {
    const { container, unmount } = render(
      <ModernQRCode value="expired-token" status="expired" onRefresh={() => undefined} />,
    );

    const refresh = container.querySelector('[data-part="refresh-button"]') as HTMLElement;
    expect(refresh).not.toBeNull();
    expect(refresh.getAttribute('style')).toBeNull();
    unmount();

    // Every status overlay is clean: the declared status opacities moved to
    // the CANVAS via the skin (K4-C round 2 + Pass 2), nothing stays inline.
    for (const status of ['loading', 'expired', 'scanned'] as const) {
      const { container: c, unmount: u } = render(
        <ModernQRCode value={`${status}-token`} status={status} onRefresh={() => undefined} />,
      );
      const overlay = c.querySelector('[data-part="overlay"]') as HTMLElement;
      expect(overlay, status).not.toBeNull();
      expect(overlay.getAttribute('style'), status).toBeNull();
      u();
    }

    const { container: loadingContainer } = render(
      <ModernQRCode value="loading-token" status="loading" />,
    );
    const spinner = loadingContainer.querySelector('[data-part="spinner"]') as HTMLElement;
    expect(spinner).not.toBeNull();
    expect(spinner.getAttribute('style')).toBeNull();
  });

  it('renders documented English fallbacks without a provider (K4-C)', () => {
    const { unmount } = render(
      <ModernQRCode value="guard-value" status="expired" onRefresh={() => undefined} />,
    );
    expect(screen.getByText('QR Code expired')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh QR code' })).toBeInTheDocument();
    unmount();

    const { unmount: unmountLoading } = render(<ModernQRCode value="guard-value" status="loading" />);
    expect(screen.getByRole('status', { name: 'Loading QR code' })).toBeInTheDocument();
    unmountLoading();

    render(<ModernQRCode value="guard-value" status="scanned" />);
    expect(screen.getByRole('status', { name: 'QR code scanned' })).toBeInTheDocument();
  });

  it('resolves the landed catalog entries through the channel (K4-C)', () => {
    // The coordinator's catalog now resolves these keys; the EN wording for
    // loading/expired/scanned is deliberately shorter than the engine's
    // standalone fallbacks, which proves real resolution (no echo).
    const { unmount } = renderWithEngine(
      <ModernQRCode value="guard-value" status="expired" onRefresh={() => undefined} />,
      'modern',
    );

    expect(screen.getByText('Expired')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh QR code' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Refresh QR code' })).toHaveTextContent('Refresh');
    // `qrcode.contains` lives in the shared encoded symbol (all engines) and
    // interpolates `{value}` end-to-end; the label lands on the inner
    // canvas/svg element.
    expect(
      screen.getByRole('img', { name: 'QR code containing: guard-value' }),
    ).toBeInTheDocument();
    unmount();

    const { unmount: unmountLoading } = renderWithEngine(
      <ModernQRCode value="guard-value" status="loading" />,
      'modern',
    );
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
    unmountLoading();

    renderWithEngine(<ModernQRCode value="guard-value" status="scanned" />, 'modern');
    expect(screen.getByRole('status', { name: 'Scanned' })).toBeInTheDocument();
  });
});
