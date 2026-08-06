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

  it('consolidates spinner/refresh-button/icon geometry into the skin through governed channels', () => {
    expect(modernSkin).toContain('--ds-qrcode-spinner-size, 24px');
    expect(modernSkin).toContain('var(--ds-qrcode-refresh-button-size)');
    expect(modernSkin).toContain('--ds-qrcode-refresh-button-padding-x, 12px');
    expect(modernSkin).toContain('--ds-qrcode-refresh-button-font-size, 13px');
    expect(modernSkin).toContain('padding: var(--ds-qrcode-icon-padding)');
    expect(modernSkin).not.toContain('--ds-qrcode-refresh-button-size, 32px');
    expect(modernSkin).not.toContain('--ds-qrcode-icon-padding, 4px');
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
    expect(modernSkin).toContain("[data-part='canvas'] {\n  opacity: var(--ds-qrcode-status-expired-opacity);");
    expect(modernSkin).toContain("[data-part='canvas'] {\n  opacity: var(--ds-qrcode-loading-opacity);");
    expect(modernSkin).toContain("[data-part='canvas'] {\n  opacity: var(--ds-qrcode-status-scanned-opacity);");
    // The round-1 ink mix is REVERTED: the declared solid-chip pair
    // (white on primary, 5.15/5.47) stands on its own.
    expect(modernSkin).not.toContain('--ds-qrcode-refresh-button-ink');
    expect(modernSkin).toContain('color: var(--ds-qrcode-refresh-button-color, var(--ds-color-primary));');
    expect(modernSkin).toContain('background: var(--ds-qrcode-refresh-button-bg);');
    expect(modernSkin).not.toContain('--ds-qrcode-refresh-button-bg, transparent');
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

describe('modern QRCode — the embedded icon stays inside the recovery budget', () => {
  const iconBox = (container: HTMLElement) =>
    container.querySelector('[data-part="icon"]') as HTMLElement | null;

  it('clamps an oversized icon to the level the caller chose', () => {
    // 120px of a 160px symbol excavates 56% of the area; level L recovers ~7%,
    // so the symbol the caller got back was unscannable.
    const { container } = render(
      <ModernQRCode value="https://rottay.com" size={160} icon="/logo.png" iconSize={120} errorLevel="L" />
    );
    // floor(160 * sqrt(0.07)) = 42
    expect(iconBox(container)?.style.width).toBe('42px');
    expect(iconBox(container)?.style.height).toBe('42px');
  });

  it('gives a higher level the larger budget it paid for', () => {
    const widths = (['L', 'M', 'Q', 'H'] as const).map((errorLevel) => {
      const { container } = render(
        <ModernQRCode value="v" size={200} icon="/logo.png" iconSize={200} errorLevel={errorLevel} />
      );
      return iconBox(container)?.style.width;
    });

    // floor(200 * sqrt(budget)) for 7% / 15% / 25% / 30%
    expect(widths).toEqual(['52px', '77px', '100px', '109px']);
  });

  it('leaves a within-budget icon exactly as authored', () => {
    const { container } = render(
      <ModernQRCode value="v" size={160} icon="/logo.png" iconSize={40} errorLevel="L" />
    );
    // The contract defaults (40 on 160 = 6.25% area) clear even the L budget.
    expect(iconBox(container)?.style.width).toBe('40px');
  });

  it('drops the icon chrome entirely for a non-positive icon size', () => {
    const { container } = render(
      <ModernQRCode value="v" size={160} icon="/logo.png" iconSize={0} />
    );
    expect(iconBox(container)).toBeNull();
  });
});

describe('modern QRCode — pass-through honesty law', () => {
  it('forwards id/aria-*/data-* to the root it owns and keeps the engine part', () => {
    const { container } = render(
      <ModernQRCode
        value="https://rottay.com"
        id="caller-qr"
        aria-describedby="qr-help"
        data-testid="qr-root"
        data-custom="caller-data"
      />
    );

    const root = container.querySelector('.rottay-qrcode--modern') as HTMLElement;
    expect(root).toHaveAttribute('id', 'caller-qr');
    expect(root).toHaveAttribute('aria-describedby', 'qr-help');
    expect(root).toHaveAttribute('data-testid', 'qr-root');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  it('lets a composing owner name the root part and never leaks the engine prop', () => {
    const { container } = render(
      <ModernQRCode value="v" engine="modern" data-part="ticket-code" />
    );
    const root = container.querySelector('.rottay-qrcode--modern') as HTMLElement;
    expect(root).toHaveAttribute('data-part', 'ticket-code');
    expect(root).not.toHaveAttribute('engine');
  });
});
