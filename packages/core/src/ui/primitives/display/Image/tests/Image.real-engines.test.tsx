import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import ClassicImage from '../engines/classic';
import ModernImage from '../engines/modern';
import RusticImage from '../engines/rustic';

describe('Image real engine coverage', () => {
  it('covers classic image load and fallback branches', async () => {
    const handleLoad = vi.fn();
    const handleError = vi.fn();

    render(
      <ClassicImage
        src="/classic.jpg"
        alt="Classic image"
        width={240}
        height={160}
        radius="lg"
        bordered
        shadow
        zoomable
        lazy
        fallback="/fallback.jpg"
        onLoad={handleLoad}
        onError={handleError}
      />
    );

    const image = screen.getByAltText('Classic image');
    await act(async () => {
      fireEvent.load(image);
      fireEvent.error(image);
    });

    expect(handleLoad).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledTimes(1);
  });

  it('covers modern image loading, error, overlay, and zoom indicator branches', async () => {
    const handleLoad = vi.fn();
    const handleError = vi.fn();

    render(
      <ModernImage
        src="/modern.jpg"
        alt="Modern image"
        width={320}
        height={180}
        radius="full"
        bordered
        shadow
        zoomable
        hoverOverlay={<span>Inspect</span>}
        onLoad={handleLoad}
        onError={handleError}
      />
    );

    const image = screen.getByAltText('Modern image');
    fireEvent.pointerEnter(image.parentElement as HTMLElement);
    expect(screen.getByText('Inspect')).toBeInTheDocument();

    await act(async () => {
      fireEvent.load(image);
    });
    await waitFor(() => {
      expect(handleLoad).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      fireEvent.error(image);
    });
    await waitFor(() => {
      expect(handleError).toHaveBeenCalledTimes(1);
    });
  });

  it('keeps the modern pulse animation skin-owned and the zoom badge logical (K4-C)', async () => {
    render(
      <ModernImage
        src="/pending.jpg"
        alt="Pending image"
        width={200}
        height={120}
        zoomable
      />
    );

    // Loading state: the default pulse block renders WITHOUT the raw Tailwind
    // `animate-pulse` utility — the skin owns the animation via
    // `ds-foundation-pulse` (single paint/motion owner per part).
    const placeholder = document.querySelector('[data-part="placeholder"]') as HTMLElement;
    expect(placeholder).not.toBeNull();
    const pulse = placeholder.querySelector('.rottay-image__pulse') as HTMLElement;
    expect(pulse).not.toBeNull();
    expect(pulse.classList.contains('animate-pulse')).toBe(false);

    // Zoom badge: physical `right-2` drained to logical `end-2` so it mirrors RTL.
    fireEvent.pointerEnter(placeholder.parentElement as HTMLElement);
    const badge = document.querySelector('[data-part="zoom-indicator"]') as HTMLElement;
    expect(badge).not.toBeNull();
    expect(badge.className).toContain('end-2');
    expect(badge.className).not.toContain('right-2');
  });

  it('covers rustic image zoom, overlay, load, and error branches', async () => {
    const handleLoad = vi.fn();
    const handleError = vi.fn();

    const { container } = render(
      <RusticImage
        src="/rustic.jpg"
        alt="Rustic image"
        width={320}
        height={180}
        radius="md"
        bordered
        shadow
        zoomable
        hoverOverlay={<span>Preview</span>}
        fallback={<span>Missing</span>}
        onLoad={handleLoad}
        onError={handleError}
      />
    );

    const image = screen.getAllByAltText('Rustic image')[0];
    const wrapper = container.querySelector('div[style]') as HTMLElement;

    fireEvent.pointerEnter(wrapper);
    expect(screen.getByText('Preview')).toBeInTheDocument();

    await act(async () => {
      fireEvent.load(image);
    });
    await waitFor(() => {
      expect(handleLoad).toHaveBeenCalledTimes(1);
    });

    await act(async () => {
      fireEvent.click(wrapper);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByRole('dialog'));
      fireEvent.error(image);
    });

    await waitFor(() => {
      expect(handleError).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Missing')).toBeInTheDocument();
    });
  });
});
