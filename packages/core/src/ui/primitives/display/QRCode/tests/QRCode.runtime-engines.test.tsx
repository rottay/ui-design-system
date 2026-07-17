import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ModernQRCode from '../engines/modern';
import RusticQRCode from '../engines/rustic';

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
