import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { I18nProvider } from '@/infrastructure/runtime/i18n';

import type { FileManagerProps } from '../contracts';
import ModernFileManager from '../engines/modern';

const SKIN = readFileSync(
  resolve(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/file-manager/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

// The chrome-none gate's CHROME list: what a host may never declare on the carrier.
const CHROME = /^(background.*|border(?!-radius).*|color|box-shadow|opacity|filter|padding.*|min-block-size|min-inline-size|block-size|min-height|height|content)$/;

const FILES: FileManagerProps['files'] = [
  { id: 'f1', name: 'report.pdf', type: 'file', mimeType: 'application/pdf', size: 4096 },
  { id: 'f2', name: 'photo.jpg', type: 'file', mimeType: 'image/jpeg', size: 512 },
];
const FOLDERS: FileManagerProps['folders'] = [{ id: 'd1', name: 'Documents', type: 'folder' }];

function Harness(props: Partial<FileManagerProps>) {
  const [selected, setSelected] = React.useState<string[]>([]);
  return (
    <ModernFileManager
      files={FILES}
      folders={FOLDERS}
      viewMode="grid"
      selectedItems={selected}
      onSelectionChange={setSelected}
      {...props}
    />
  );
}

const activations = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLButtonElement>('[data-part="grid-card"] .ds-file-manager__grid-card-activate'));

function rules(css: string): Array<{ selector: string; body: string; forced: boolean }> {
  const out: Array<{ selector: string; body: string; forced: boolean }> = [];
  const forcedStart = css.indexOf('@media (forced-colors: active)');
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(css))) {
    const selector = match[1].replace(/@media[^{]*\{/, '').trim();
    out.push({ selector, body: match[2], forced: forcedStart >= 0 && match.index > forcedStart });
  }
  return out;
}

const declared = (body: string) =>
  body.split(';').map((d) => d.split(':')[0].trim()).filter(Boolean);

describe('FileManager modern grid card activation is a stretched chrome-less Button (T1)', () => {
  it('renders one activation per card inside the frame and leaves the host role-free', () => {
    const { container } = render(<Harness />);
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-part="grid-card"]'));
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      const buttons = card.querySelectorAll('.ds-file-manager__grid-card-activate');
      expect(buttons).toHaveLength(1);
      const button = buttons[0] as HTMLButtonElement;
      expect(button.tagName).toBe('BUTTON');
      expect(button).toHaveAttribute('type', 'button');
      expect(button).toHaveAttribute('data-chrome', 'none');
      expect(button.parentElement).toHaveAttribute('data-part', 'grid-card-hit');
      expect(button.parentElement?.parentElement).toBe(card);
      expect(card.firstElementChild).toBe(button.parentElement);
      expect(button.textContent).toBe('');
      expect(button.querySelector('button, a, input, select, textarea, [tabindex]')).toBeNull();
      for (const attr of ['role', 'tabindex', 'aria-pressed', 'onclick']) expect(card).not.toHaveAttribute(attr);
      expect(card).toHaveAttribute('data-interactive', 'true');
    }
  });

  it('names each activation by the item name, with the same text as its tooltip', () => {
    const { container } = render(<Harness />);
    for (const [index, name] of ['Documents', 'report.pdf', 'photo.jpg'].entries()) {
      const button = activations(container)[index];
      expect(button).toHaveAccessibleName(name);
      expect(button).toHaveAttribute('title', name);
      expect(button.getAttribute('aria-labelledby')).toBe(button.closest('[data-part="grid-card"]')?.querySelector('[data-part="grid-card-body"]')?.id);
    }
  });

  it('presses files and never folders', () => {
    const { container } = render(<Harness />);
    const [folder, file] = activations(container);
    expect(folder).not.toHaveAttribute('aria-pressed');
    expect(file).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(file);
    expect(activations(container)[1]).toHaveAttribute('aria-pressed', 'true');
    expect(activations(container)[1].closest('[data-part="grid-card"]')).toHaveAttribute('data-selected', 'true');
  });

  it('activates once per click, Enter and Space, and ignores other keys', () => {
    const onNavigate = vi.fn();
    const onSelectionChange = vi.fn();
    const { container } = render(
      <ModernFileManager files={FILES} folders={FOLDERS} viewMode="grid" onNavigate={onNavigate} onSelectionChange={onSelectionChange} />,
    );
    const [folder, file] = activations(container);
    fireEvent.click(folder);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(folder, { key: 'Enter' });
    expect(onNavigate).toHaveBeenCalledTimes(2);
    fireEvent.keyDown(folder, { key: ' ' });
    expect(onNavigate).toHaveBeenCalledTimes(3);
    expect(onNavigate).toHaveBeenLastCalledWith('d1');
    for (const key of ['a', 'Tab', 'Escape']) fireEvent.keyDown(folder, { key });
    expect(onNavigate).toHaveBeenCalledTimes(3);

    fireEvent.click(file);
    fireEvent.keyDown(file, { key: 'Enter' });
    fireEvent.keyDown(file, { key: ' ' });
    fireEvent.keyDown(file, { key: 'x' });
    expect(onSelectionChange).toHaveBeenCalledTimes(3);
    expect(onSelectionChange).toHaveBeenLastCalledWith(['f1']);
  });

  it('keeps one roving stop and walks it with arrows, Home and End', () => {
    const { container } = render(<Harness />);
    const stops = () => activations(container).filter((button) => button.tabIndex === 0);
    expect(stops()).toHaveLength(1);
    act(() => activations(container)[0].focus());
    fireEvent.keyDown(activations(container)[0], { key: 'ArrowRight' });
    expect(activations(container)[1]).toHaveFocus();
    fireEvent.keyDown(activations(container)[1], { key: 'ArrowDown' });
    expect(activations(container)[2]).toHaveFocus();
    fireEvent.keyDown(activations(container)[2], { key: 'ArrowUp' });
    expect(activations(container)[1]).toHaveFocus();
    fireEvent.keyDown(activations(container)[1], { key: 'ArrowLeft' });
    expect(activations(container)[0]).toHaveFocus();
    fireEvent.keyDown(activations(container)[0], { key: 'End' });
    expect(activations(container)[2]).toHaveFocus();
    fireEvent.keyDown(activations(container)[2], { key: 'Home' });
    expect(activations(container)[0]).toHaveFocus();
    expect(stops()).toEqual([activations(container)[0]]);
  });

  it('moves forward on ArrowLeft under RTL', () => {
    const { container } = render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <Harness />
      </I18nProvider>,
    );
    act(() => activations(container)[0].focus());
    fireEvent.keyDown(activations(container)[0], { key: 'ArrowLeft' });
    expect(activations(container)[1]).toHaveFocus();
  });

  it('feeds the card its focus-visible state from the activation it hosts', () => {
    const { container } = render(<Harness />);
    const button = activations(container)[1];
    act(() => button.focus());
    expect(button.closest('[data-part="grid-card"]')?.getAttribute('data-state')).toMatch(/\bfocus-visible\b/);
  });
});

describe('FileManager modern grid card skin keeps the carrier non-painting (T2)', () => {
  const all = rules(SKIN);

  it('declares a non-painting, corner-clipped frame', () => {
    const frame = all.find((rule) => /> \[data-part='grid-card-hit'\]$/.test(rule.selector));
    expect(frame).toBeDefined();
    const body = frame!.body.replace(/\s+/g, ' ');
    for (const declaration of ['position: absolute', 'z-index: var(--ds-z-index-relative-above)', 'inset: -1px', 'border-radius: inherit', 'clip-path: border-box', 'opacity: 0']) {
      expect(body).toContain(declaration);
    }
    expect(declared(frame!.body)).not.toContain('overflow');
  });

  it('places the carrier and never touches its paint or kept arms', () => {
    const placement = all.find((rule) => /\[data-part='grid-card-hit'\] > \.ds-file-manager__grid-card-activate$/.test(rule.selector));
    expect(placement && declared(placement.body)).toEqual(['position', 'inset', 'max-inline-size']);
    const onCarrier = all.filter((rule) => rule.selector.split(',').some((part) => /\.ds-file-manager__grid-card-activate[^\s>+~]*$/.test(part.trim())));
    expect(onCarrier.length).toBeGreaterThan(0);
    for (const rule of onCarrier) expect(declared(rule.body).filter((property) => CHROME.test(property))).toEqual([]);
  });

  it('keys the frame rules on data-interactive and keeps the forced Highlight pair', () => {
    expect(SKIN).not.toContain("[role='button']");
    const selected = all.find((rule) => rule.forced && /\[data-interactive='true'\]\[data-selected='true'\]$/.test(rule.selector));
    expect(selected?.body.replace(/\s+/g, ' ')).toMatch(/border-color: Highlight; background: Highlight; color: HighlightText;/);
    const rest = all.find((rule) => rule.forced && /\[data-interactive='true'\]\[data-selected='false'\]$/.test(rule.selector));
    expect(rest?.body.replace(/\s+/g, ' ')).toMatch(/border-color: ButtonText; background: Canvas;/);
  });

  it('positions the host for the stretched frame', () => {
    const host = all.find((rule) => /\.ds-file-manager__grid-card\[data-part='grid-card'\]$/.test(rule.selector) && !rule.forced);
    expect(host && declared(host.body)).toContain('position');
  });
});

describe('FileManager modern grid probe names', () => {
  it('reaches the folder through its activation by role and name', () => {
    render(<Harness />);
    expect(screen.getByRole('button', { name: 'Documents' })).toHaveClass('ds-file-manager__grid-card-activate');
    expect(screen.getByRole('button', { name: 'Documents' })).toHaveAttribute('data-part', 'trigger');
  });
});
