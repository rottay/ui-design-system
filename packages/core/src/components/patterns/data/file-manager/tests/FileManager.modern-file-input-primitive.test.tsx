import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { FileManagerProps } from '../contracts';
import ModernFileManager from '../engines/modern';

const SKIN = readFileSync(
  join(__dirname, '../../../../../foundation/tokens/css/runtime/engines/modern/skin/file-manager/index.css'),
  'utf8',
).replace(/\/\*[\s\S]*?\*\//g, '');

function renderManager(overrides: Partial<FileManagerProps> = {}) {
  return render(
    <ModernFileManager
      files={[{ id: 'f1', name: 'report.pdf', type: 'file', mimeType: 'application/pdf', size: 4096 }]}
      folders={[]}
      onUpload={vi.fn()}
      {...overrides}
    />,
  );
}

describe('ModernFileManager hidden picker composes the Input primitive', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders the bare file branch: no field wrapper, no shell chrome, the pinned hooks kept', () => {
    renderManager();
    const picker = screen.getByTestId('file-input') as HTMLInputElement;

    expect(picker.tagName).toBe('INPUT');
    expect(picker.type).toBe('file');
    expect(picker.multiple).toBe(true);
    expect(picker).toHaveClass('ds-file-manager__file-input');
    expect(picker.getAttribute('data-part')).toBe('file-input');
    expect(picker.className).not.toMatch(/ds-input-shell/);
    expect(picker.closest('.ds-input-field')).toBeNull();
  });

  it('opens the picker from the Upload button through the forwarded ref', () => {
    const click = vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(() => {});
    renderManager();

    fireEvent.click(screen.getByRole('button', { name: /upload/i }));

    expect(click).toHaveBeenCalledTimes(1);
    expect(click.mock.instances[0]).toBe(screen.getByTestId('file-input'));
  });

  it('hands the chosen files to onUpload from the native change event', () => {
    const onUpload = vi.fn();
    renderManager({ onUpload });
    const picker = screen.getByTestId('file-input');
    const file = new File(['x'], 'notes.txt', { type: 'text/plain' });

    fireEvent.change(picker, { target: { files: [file] } });

    expect(onUpload).toHaveBeenCalledWith([file]);
  });

  it('is hidden by its className landing, so no caller data-part is load-bearing (P-88)', () => {
    const rule = SKIN.match(/([^{}]*\.ds-file-manager__file-input[^{}]*)\{([^{}]*)\}/);
    expect(rule).not.toBeNull();
    const selectors = rule![1].split(',').map((selector) => selector.replace(/\s+/g, ' ').trim());
    expect(selectors).toContain('.ds-pattern-file-manager.ds-engine-modern .ds-file-manager__file-input');
    expect(rule![2].trim()).toBe('display: none;');
    const partOnly = [...SKIN.matchAll(/([^{}]*)\{[^{}]*\}/g)]
      .map(([, selector]) => selector)
      .filter((selector) => selector.includes("[data-part='file-input']") && !selector.includes('.ds-file-manager__file-input'));
    expect(partOnly).toEqual([]);
  });
});
