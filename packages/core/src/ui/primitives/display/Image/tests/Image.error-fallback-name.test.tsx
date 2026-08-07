/**
 * @fileoverview Modern Image error-state accessible-name contract.
 *
 * Before this suite the error branch rendered `<div data-part="fallback">` with
 * a DECORATIVE icon inside and left the failed `<img>` in the accessibility
 * tree. The panel that replaces the picture therefore reached assistive
 * technology as an unlabelled box, while the skin holds the failed `<img>` at
 * opacity 0 -- so the picture's meaning was present in neither channel in a way
 * a user could act on. `Image.Fallback` (the compound) already published
 * `role="img"` + a name; the engine's inline fallback silently diverged.
 */

import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';

import ModernImage from '../engines/modern';

/** Fails the `<img>` the engine mounted, driving `status` to 'error'. */
function failTheImage(container: HTMLElement): void {
  const img = container.querySelector('img[data-part="img"]');
  expect(img).not.toBeNull();
  fireEvent.error(img as HTMLImageElement);
}

describe('Modern Image - error fallback accessible name', () => {
  it('names the fallback panel with the caller alt when the load fails', () => {
    const { container } = render(<ModernImage src="/broken.png" alt="Team photo" />);

    // Healthy state: the picture itself carries the name.
    expect(screen.getByRole('img', { name: 'Team photo' })).toBe(
      container.querySelector('img[data-part="img"]')
    );

    failTheImage(container);

    const fallback = container.querySelector('[data-part="fallback"]');
    expect(fallback).not.toBeNull();
    // The panel is the named substitute now, not an unlabelled box.
    expect(fallback).toHaveAttribute('role', 'img');
    expect(screen.getByRole('img', { name: 'Team photo' })).toBe(fallback);
  });

  it('falls back to the published failure string when no alt was supplied', () => {
    const { container } = render(<ModernImage src="/broken.png" />);
    failTheImage(container);

    const fallback = screen.getByRole('img', { name: 'Image failed to load' });
    expect(fallback).toHaveAttribute('data-part', 'fallback');
  });

  it('treats a whitespace-only alt as no alt rather than an empty name', () => {
    const { container } = render(<ModernImage src="/broken.png" alt="   " />);
    failTheImage(container);

    expect(screen.getByRole('img', { name: 'Image failed to load' })).toBe(
      container.querySelector('[data-part="fallback"]')
    );
  });

  it('removes the failed img from the accessibility tree so the alt is not announced twice', () => {
    const { container } = render(<ModernImage src="/broken.png" alt="Team photo" />);
    failTheImage(container);

    const img = container.querySelector('img[data-part="img"]');
    expect(img).toHaveAttribute('aria-hidden', 'true');
    // Exactly one named image survives: the fallback panel.
    expect(screen.getAllByRole('img', { name: 'Team photo' })).toHaveLength(1);
  });

  it('keeps a caller-supplied decorative fallback node reachable under the panel name', () => {
    const { container } = render(
      <ModernImage
        src="/broken.png"
        alt="Quarterly chart"
        fallback={<span aria-hidden="true">--</span>}
      />
    );
    failTheImage(container);

    const fallback = screen.getByRole('img', { name: 'Quarterly chart' });
    expect(within(fallback).getByText('--')).toBeInTheDocument();
    expect(container.querySelector('[data-part="fallback"]')).toBe(fallback);
  });

  it('leaves the img in the accessibility tree while it is still loading or loaded', () => {
    const { container } = render(<ModernImage src="/photo.png" alt="Team photo" />);
    const img = container.querySelector('img[data-part="img"]') as HTMLImageElement;

    expect(img).not.toHaveAttribute('aria-hidden');
    fireEvent.load(img);
    expect(img).not.toHaveAttribute('aria-hidden');
    expect(container.querySelector('[data-part="fallback"]')).toBeNull();
  });
});
