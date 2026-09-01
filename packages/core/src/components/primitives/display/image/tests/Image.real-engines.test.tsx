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

describe('Image modern — intrinsic sizing and space reservation', () => {
  it('reserves the frame from a known pixel pair so the reveal costs no shift', () => {
    const { container } = render(<ModernImage src="/p.jpg" alt="Photo" width={640} height={360} />);

    const root = container.querySelector('.rottay-image--modern') as HTMLElement;
    const img = container.querySelector('img') as HTMLImageElement;

    expect(root.style.aspectRatio).toBe('640 / 360');
    expect(img).toHaveAttribute('width', '640');
    expect(img).toHaveAttribute('height', '360');
  });

  it('keeps CSS lengths off the width/height attributes', () => {
    const { container } = render(
      <ModernImage src="/p.jpg" alt="Photo" width="100%" height="12rem" />
    );

    const img = container.querySelector('img') as HTMLImageElement;
    // The attributes take pixel integers only; '100%' reaching them made the
    // UA read a bare 100 and hand the img a wrong intrinsic ratio.
    expect(img).not.toHaveAttribute('width');
    expect(img).not.toHaveAttribute('height');
    // The CSS channel still carries them.
    const root = container.querySelector('.rottay-image--modern') as HTMLElement;
    expect(root.style.width).toBe('100%');
    expect(root.style.height).toBe('12rem');
    expect(root.style.aspectRatio).toBe('');
  });

  it('accepts pixel-suffixed and bare-number strings as intrinsic dimensions', () => {
    const { container } = render(
      <ModernImage src="/p.jpg" alt="Photo" width="800px" height="600" />
    );
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
    expect((container.querySelector('.rottay-image--modern') as HTMLElement).style.aspectRatio)
      .toBe('800 / 600');
  });

  it('lets an explicit aspectRatio win over the derived pair', () => {
    const { container } = render(
      <ModernImage src="/p.jpg" alt="Photo" width={640} height={360} aspectRatio="1 / 1" />
    );
    expect((container.querySelector('.rottay-image--modern') as HTMLElement).style.aspectRatio)
      .toBe('1 / 1');
  });

  it('reserves nothing when only one dimension is known', () => {
    const { container } = render(<ModernImage src="/p.jpg" alt="Photo" width={640} />);
    const root = container.querySelector('.rottay-image--modern') as HTMLElement;
    expect(root.style.aspectRatio).toBe('');
    expect(container.querySelector('img')).not.toHaveAttribute('height');
  });
});

describe('Image modern — pass-through honesty law', () => {
  it('forwards id/aria-*/data-* to the frame it owns and keeps the engine part', () => {
    const { container } = render(
      <ModernImage
        src="/p.jpg"
        alt="Photo"
        id="caller-image"
        aria-describedby="caption-1"
        data-testid="image-root"
        data-custom="caller-data"
      />
    );

    const root = container.querySelector('.rottay-image--modern') as HTMLElement;
    expect(root).toHaveAttribute('id', 'caller-image');
    expect(root).toHaveAttribute('aria-describedby', 'caption-1');
    expect(root).toHaveAttribute('data-testid', 'image-root');
    expect(root).toHaveAttribute('data-custom', 'caller-data');
    expect(root).toHaveAttribute('data-part', 'root');
  });

  it('lets a composing owner name the root part', () => {
    const { container } = render(
      <ModernImage src="/p.jpg" alt="Photo" data-part="card-media" />
    );
    expect(container.querySelector('.rottay-image--modern')).toHaveAttribute('data-part', 'card-media');
  });

  it('never leaks non-DOM contract fields onto the frame', () => {
    const { container } = render(
      <ModernImage src="/p.jpg" alt="Photo" engine="modern" quality={80} blurDataURL="data:," />
    );
    const root = container.querySelector('.rottay-image--modern') as HTMLElement;
    expect(root).not.toHaveAttribute('engine');
    expect(root).not.toHaveAttribute('quality');
    expect(root).not.toHaveAttribute('blurdataurl');
  });
});
