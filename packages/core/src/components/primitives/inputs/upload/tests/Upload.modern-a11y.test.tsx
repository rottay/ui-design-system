/**
 * Modern-engine accessibility contract for the Upload file list.
 *
 * Two defects are pinned here: (1) the `picture` row wired preview to a bare
 * `<img onClick>`, so no keyboard could ever reach it; (2) the async
 * uploading -> error transition was rendered into a static `role="list"`,
 * so a screen-reader user was never told the upload failed.
 */
import React from 'react';
import { act, fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Upload as ModernUpload, Dragger as ModernDragger } from '../engines/modern';
import { renderWithEngine } from '@tests/support/engine';
import ModernFormField from '@/components/primitives/inputs/form-field/engines/modern';
import type { UploadProps } from '../contracts';
import ModernButton from '@/components/primitives/inputs/button/engines/modern';
import { ActionUploadIcon } from '@/graphics/icons/semantic/generated/roles/action-upload';

const imageFile = {
  uid: 'image',
  name: 'cover.png',
  status: 'done' as const,
  type: 'image/png',
  thumbUrl: 'https://example.com/cover.png',
};

describe('Upload modern engine: picture-row preview is keyboard operable', () => {
  it('Tab reaches the preview control in a picture row', async () => {
    const user = userEvent.setup();
    renderWithEngine(
      <ModernUpload listType="picture" defaultFileList={[imageFile]} onPreview={vi.fn()} />,
      'modern'
    );

    const preview = screen.getByRole('button', { name: 'Preview cover.png' });

    const reached: Element[] = [];
    for (let i = 0; i < 6; i += 1) {
      await user.tab();
      if (document.activeElement) reached.push(document.activeElement);
    }

    expect(reached).toContain(preview);
  });

  it('Enter and Space on the preview control invoke onPreview', async () => {
    const user = userEvent.setup();
    const onPreview = vi.fn();
    renderWithEngine(
      <ModernUpload listType="picture" defaultFileList={[imageFile]} onPreview={onPreview} />,
      'modern'
    );

    const preview = screen.getByRole('button', { name: 'Preview cover.png' });
    await act(async () => {
      preview.focus();
    });
    expect(preview).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'cover.png' }));

    onPreview.mockClear();
    await user.keyboard(' ');
    expect(onPreview).toHaveBeenCalledWith(expect.objectContaining({ name: 'cover.png' }));
  });
});

describe('Upload modern engine: status changes are announced', () => {
  it('a rejected upload renders its error inside a polite live region', async () => {
    const uploading = {
      uid: 'broken',
      name: 'broken.png',
      status: 'uploading' as const,
      percent: 40,
      type: 'image/png',
    };

    const { rerender } = renderWithEngine(
      <ModernUpload fileList={[uploading]} />,
      'modern'
    );

    // The async uploading -> error transition is exactly what a screen reader
    // was never told about.
    await act(async () => {
      rerender(
        <ModernUpload
          fileList={[{ ...uploading, status: 'error' as const, error: new Error('Upload rejected') }]}
        />
      );
    });

    const errorText = await screen.findByText('Upload rejected');
    const live = errorText.closest('[aria-live]');

    expect(live).not.toBeNull();
    expect(live?.getAttribute('aria-live')).toBe('polite');
    // atomic=false so a new row announces itself, never the whole list again.
    expect(live?.getAttribute('aria-atomic')).toBe('false');
    expect(live?.getAttribute('data-part')).toBe('file-list');
    expect(within(live as HTMLElement).getByText('Upload rejected')).toBeInTheDocument();
  });
});

// Removing a row unmounts the focused button, so focus must move first or it
// strands on <body> and a keyboard user loses their place.
describe('Upload modern engine: removing a row does not strand keyboard focus', () => {
  const files = [
    { uid: '1', name: 'alpha.txt', status: 'done' as const },
    { uid: '2', name: 'bravo.txt', status: 'done' as const },
    { uid: '3', name: 'charlie.txt', status: 'done' as const },
  ];

  it('moves focus to the next row remove button after removal', () => {
    renderWithEngine(<ModernUpload defaultFileList={files} />, 'modern');

    fireEvent.click(screen.getByRole('button', { name: 'Remove bravo.txt' }));

    expect(screen.getByRole('button', { name: 'Remove charlie.txt' })).toHaveFocus();
  });

  it('falls back to the previous row remove button when the last row is removed', () => {
    renderWithEngine(<ModernUpload defaultFileList={files} />, 'modern');

    fireEvent.click(screen.getByRole('button', { name: 'Remove charlie.txt' }));

    expect(screen.getByRole('button', { name: 'Remove bravo.txt' })).toHaveFocus();
  });

  // With one file there is no neighbour at all, which is exactly the case the
  // neighbour-only restore left stranded on <body>.
  it('falls back to the upload trigger when the only file is removed', () => {
    const { container } = renderWithEngine(
      <ModernUpload defaultFileList={[files[1]]} />,
      'modern',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove bravo.txt' }));

    expect(document.activeElement).not.toBe(document.body);
    expect(document.activeElement).toBe(
      container.querySelector('[data-part="trigger"] button, [data-part="dropzone"]'),
    );
  });
});


const uploadModes = ['text', 'picture', 'picture-card', 'picture-circle'] as const;

describe('Upload modern field binding and existing triggers', () => {
  it.each(uploadModes)('%s binds the native file input and describes the keyboard trigger', async (listType) => {
    const user = userEvent.setup();
    const { container } = renderWithEngine(
      <ModernFormField label="Attachments" name="attachments" error="Add a valid file.">
        <ModernUpload listType={listType} />
      </ModernFormField>, 'modern'
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(screen.getByLabelText('Attachments')).toBe(input);
    expect(input).toHaveAccessibleName('Attachments');
    expect(input).toHaveAccessibleDescription('Add a valid file.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const trigger = screen.getByRole('button', { name: listType === 'text' || listType === 'picture' ? 'Upload' : 'Add file' });
    expect(trigger).toHaveAccessibleDescription('Add a valid file.');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger.querySelector('button, [role="button"], input')).toBeNull();
    const click = vi.spyOn(input!, 'click');
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it.each(uploadModes)('%s preserves custom button semantics without an interactive ancestor', async (listType) => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = renderWithEngine(
      <><p id="custom-help">Button context.</p>
        <ModernFormField label="Evidence files" name="evidence" help="Allowed files.">
          <ModernUpload listType={listType}>
            <button type="button" aria-label="Choose evidence" aria-describedby="custom-help" onClick={onClick}>Choose</button>
          </ModernUpload>
        </ModernFormField>
      </>, 'modern'
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    const button = screen.getByRole('button', { name: 'Choose evidence' });
    expect(button.parentElement?.closest('button, label, [role="button"]')).toBeNull();
    expect(button).toHaveAccessibleDescription('Button context. Allowed files.');
    expect(input).toHaveAccessibleName('Evidence files');
    expect(screen.getByLabelText('Evidence files')).toBe(input);
    const click = vi.spyOn(input!, 'click');
    await user.click(button);
    expect(click).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it.each(uploadModes)('%s forwards only the declared native binding props and retains caller naming precedence', (listType) => {
    const binding = {
      id: 'caller-file', 'aria-label': 'Fallback file name', 'aria-labelledby': 'file-label',
      'aria-describedby': 'file-context', 'aria-invalid': 'grammar',
    } satisfies Pick<UploadProps, 'id' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'>;
    const { container } = renderWithEngine(
      <><p id="file-label">Caller file name</p><p id="file-context">Caller file context.</p>
        <ModernUpload {...binding} listType={listType} />
      </>, 'modern'
    );
    const input = container.querySelector('input[type="file"]');
    expect(input).toHaveAttribute('id', 'caller-file');
    expect(input).toHaveAttribute('aria-label', 'Fallback file name');
    expect(input).toHaveAccessibleName('Caller file name');
    expect(input).toHaveAccessibleDescription('Caller file context.');
    expect(input).toHaveAttribute('aria-invalid', 'grammar');
    expect(container.querySelector('[data-part="root"]')).not.toHaveAttribute('id');
    expect(screen.getByRole('button')).toHaveAccessibleDescription('Caller file context.');
  });

  it('forwards inherited binding props to Dragger native input and validation context to its dropzone', () => {
    const { container } = renderWithEngine(
      <ModernFormField label="Drop attachments" name="drop" error="Invalid attachment.">
        <ModernDragger id="drop-file" />
      </ModernFormField>, 'modern'
    );
    const input = container.querySelector('input[type="file"]');
    expect(screen.getByLabelText('Drop attachments')).toBe(input);
    expect(input).toHaveAttribute('id', 'drop-file');
    expect(input).toHaveAccessibleName('Drop attachments');
    expect(input).toHaveAccessibleDescription('Invalid attachment.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(container.querySelector('[data-part="dropzone"]')).toHaveAccessibleDescription('Invalid attachment.');
  });

  it('clears validation on both the input and default trigger while retaining their identity', () => {
    const field = (error?: string) => (
      <ModernFormField label="Files" name="files" error={error} help="Choose a document.">
        <ModernUpload />
      </ModernFormField>
    );
    const { container, rerender } = renderWithEngine(field('Invalid document.'), 'modern');
    const input = container.querySelector('input[type="file"]');
    const trigger = screen.getByRole('button', { name: 'Upload' });
    expect(trigger).toHaveAccessibleDescription('Invalid document.');
    rerender(field());
    expect(container.querySelector('input[type="file"]')).toBe(input);
    expect(screen.getByRole('button', { name: 'Upload' })).toBe(trigger);
    expect(input).toHaveAccessibleDescription('Choose a document.');
    expect(trigger).toHaveAccessibleDescription('Choose a document.');
    expect(input).not.toHaveAttribute('aria-invalid', 'true');
    expect(trigger).not.toHaveAttribute('aria-invalid', 'true');
  });
});


describe('Upload modern trigger composition boundaries', (listType) => {
  const pictureModes = ['picture-card', 'picture-circle'] as const;
  it.each(pictureModes)('%s keeps nested and fragment buttons outside interactive wrappers', (listType) => {
    const { container } = renderWithEngine(
      <ModernFormField label="Nested files" name="nested" help="Upload context.">
        <ModernUpload listType={listType}>
          <><span><button type="button">Choose nested files</button></span></>
        </ModernUpload>
      </ModernFormField>, 'modern'
    );
    const trigger = screen.getByRole('button', { name: 'Choose nested files' });
    expect(trigger.parentElement?.closest('button, label, [role="button"]')).toBeNull();
    expect(trigger).toHaveAccessibleDescription('Upload context.');
    expect(container.querySelector('input[type="file"]')).toHaveAccessibleName('Nested files');
  });

  it.each(uploadModes)('%s retains a default trigger with empty children and blocks disabled activation', (listType) => {
    const { container } = renderWithEngine(<ModernUpload listType={listType} disabled>{false}</ModernUpload>, 'modern');
    const trigger = screen.getByRole('button');
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).toBeDisabled();
    const click = vi.spyOn(input!, 'click');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(click).not.toHaveBeenCalled();
  });
});


function CustomUploadButton(props: React.ComponentProps<'button'>) {
  const id = React.useId();
  return <button type="button" id={id} {...props} />;
}

const MemoUploadButton = React.memo(CustomUploadButton);
const RefUploadButton = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'>>(
  (props, ref) => <button type="button" ref={ref} {...props} />,
);
const customButtons = [
  { name: 'function', control: <CustomUploadButton /> },
  { name: 'memo', control: <MemoUploadButton /> },
  { name: 'forwardRef', control: <RefUploadButton /> },
  { name: 'DS Button', control: <ModernButton /> },
];
const customButtonModes = uploadModes.flatMap((listType) => customButtons.map((button) => ({ ...button, listType })));
const pictureTriggerModes = ['picture-card', 'picture-circle'] as const;

describe('Upload modern opaque trigger content', () => {
  it.each(pictureTriggerModes)('%s keeps an icon component custom child keyboard operable', async (listType) => {
    const user = userEvent.setup();
    const { container } = renderWithEngine(
      <ModernUpload listType={listType}><ActionUploadIcon decorative size={24} /></ModernUpload>, 'modern',
    );
    const trigger = screen.getByRole('button', { name: 'Add file' });
    expect(trigger).toHaveAttribute('tabindex', '0');
    expect(trigger.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    const click = vi.spyOn(input!, 'click');
    for (let step = 0; step < 3 && document.activeElement !== trigger; step += 1) await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(click).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it.each(pictureTriggerModes)('%s preserves field binding with nested decorative component content', async (listType) => {
    const user = userEvent.setup();
    const { container } = renderWithEngine(
      <ModernFormField label="Decorated files" name="decorated" error="Select a valid file.">
        <ModernUpload listType={listType}>
          <><span><ActionUploadIcon decorative size={24} /></span></>
        </ModernUpload>
      </ModernFormField>, 'modern',
    );
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(screen.getByLabelText('Decorated files')).toBe(input);
    expect(input).toHaveAccessibleName('Decorated files');
    expect(input).toHaveAccessibleDescription('Select a valid file.');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    const trigger = screen.getByRole('button', { name: 'Add file' });
    expect(trigger).toHaveAccessibleDescription('Select a valid file.');
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger.querySelector('button, [role="button"], input')).toBeNull();
    const click = vi.spyOn(input!, 'click');
    for (let step = 0; step < 3 && document.activeElement !== trigger; step += 1) await user.tab();
    expect(trigger).toHaveFocus();
    await user.keyboard('{Enter} ');
    expect(click).toHaveBeenCalledTimes(2);
  });

  it.each(customButtonModes)('$listType keeps a real $name custom button passive, named and keyboard operable', async ({ listType, control }) => {
    const user = userEvent.setup();
    const handler = vi.fn();
    const { container } = renderWithEngine(
      <><p id="component-context">Caller context.</p>
        <ModernFormField label="Custom files" name="custom" error="Field context.">
          <ModernUpload listType={listType}>
            {React.cloneElement(control, {
              'aria-label': 'Choose custom files', 'aria-describedby': 'component-context',
              onClick: handler, children: 'Choose',
            })}
          </ModernUpload>
        </ModernFormField>
      </>, 'modern',
    );
    const button = screen.getByRole('button', { name: 'Choose custom files' });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(button.parentElement?.closest('button, label, [role="button"]')).toBeNull();
    expect(button).toHaveAccessibleDescription('Caller context. Field context.');
    expect(button).toHaveAttribute('aria-invalid', 'true');
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(screen.getByLabelText('Custom files')).toBe(input);
    expect(input).toHaveAccessibleName('Custom files');
    const click = vi.spyOn(input!, 'click');
    for (let step = 0; step < 3 && document.activeElement !== button; step += 1) await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    await user.keyboard(' ');
    expect(handler).toHaveBeenCalledTimes(2);
    expect(click).toHaveBeenCalledTimes(2);
  });

  it.each(pictureTriggerModes)('%s blocks a disabled decorative component trigger', (listType) => {
    const { container } = renderWithEngine(
      <ModernUpload listType={listType} disabled><ActionUploadIcon decorative size={24} /></ModernUpload>, 'modern',
    );
    const trigger = screen.getByRole('button', { name: 'Add file' });
    expect(trigger).toHaveAttribute('tabindex', '-1');
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).toBeDisabled();
    const click = vi.spyOn(input!, 'click');
    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: 'Enter' });
    fireEvent.keyDown(trigger, { key: ' ' });
    expect(click).not.toHaveBeenCalled();
  });

  it.each(pictureTriggerModes)('%s follows a custom component changing its rendered semantics', async (listType) => {
    let setInteractive: React.Dispatch<React.SetStateAction<boolean>>;
    function ChangingContent() {
      const [interactive, setState] = React.useState(false);
      setInteractive = setState;
      return interactive ? <button type="button">Choose dynamically</button> : <ActionUploadIcon decorative size={24} />;
    }
    renderWithEngine(<ModernUpload listType={listType}><ChangingContent /></ModernUpload>, 'modern');
    expect(screen.getByRole('button', { name: 'Add file' })).toHaveAttribute('tabindex', '0');
    await act(async () => { setInteractive(true); });
    const button = screen.getByRole('button', { name: 'Choose dynamically' });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(button.parentElement?.closest('button, label, [role="button"]')).toBeNull();
    await act(async () => { setInteractive(false); });
    expect(screen.getByRole('button', { name: 'Add file' })).toHaveAttribute('tabindex', '0');
  });
});
