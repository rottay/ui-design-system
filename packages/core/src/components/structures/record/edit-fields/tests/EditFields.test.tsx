/**
 * @fileoverview Tests for the `edit-fields` structures family — the
 * single-surface record edit chrome (InlineEditor, InlineEditGrid,
 * InlineEditField, MoreFieldsToggle, InlineEditFooter).
 *
 * Renders through `renderSurface` under all three engines to prove the
 * family is engine-portable through primitive composition alone (it ships
 * no `engines/*` split of its own). `renderSurface` resolves through a
 * Suspense boundary, so the first query in every test awaits `findBy*`;
 * once that settles, subsequent queries in the same test can be
 * synchronous.
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';

import type { EngineName } from '../../../../../contracts';
import { renderSurface } from '../../../../surfaces/foundation/common/test-utils';
import {
  InlineEditControl,
  InlineEditField,
  InlineEditFooter,
  InlineEditGrid,
  InlineEditor,
  InlineEditorGroup,
  InlineEditSection,
  MoreFieldsToggle,
} from '../index';

const ENGINES: EngineName[] = ['classic', 'modern', 'rustic'];

describe('InlineEditor', () => {
  it.each(ENGINES)('renders title, eyebrow, and description under the %s engine', async (engine) => {
    renderSurface(
      <InlineEditor title="Basic information" eyebrow="Profile" description="Name and contact routing.">
        <div />
      </InlineEditor>,
      { engine },
    );

    expect(await screen.findByText('Basic information')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
    expect(screen.getByText('Name and contact routing.')).toBeTruthy();
  });

  it('omits the header entirely when headerless is set', async () => {
    renderSurface(
      <InlineEditor title="Hidden title" headerless>
        <div>field content</div>
      </InlineEditor>,
    );

    expect(await screen.findByText('field content')).toBeTruthy();
    expect(screen.queryByText('Hidden title')).toBeNull();
  });

  it('renders a footer from footerProps without a separate footer node', async () => {
    const onSave = vi.fn();
    renderSurface(
      <InlineEditor title="Section" footerProps={{ onSave, saveLabel: 'Save section' }}>
        <div />
      </InlineEditor>,
    );

    fireEvent.click(await screen.findByRole('button', { name: 'Save section' }));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});

describe('InlineEditorGroup', () => {
  it('stacks multiple InlineEditor blocks', async () => {
    renderSurface(
      <InlineEditorGroup>
        <InlineEditor title="Profile">
          <div />
        </InlineEditor>
        <InlineEditor title="Preferences">
          <div />
        </InlineEditor>
      </InlineEditorGroup>,
    );

    expect(await screen.findByText('Profile')).toBeTruthy();
    expect(screen.getByText('Preferences')).toBeTruthy();
  });
});

describe('InlineEditField', () => {
  it.each(ENGINES)('associates the label with its control via htmlFor under the %s engine', async (engine) => {
    renderSurface(
      <InlineEditField label="Full name" htmlFor="full-name-input" hint="As it appears on the offer letter.">
        <input id="full-name-input" />
      </InlineEditField>,
      { engine },
    );

    const control = (await screen.findByLabelText('Full name')) as HTMLInputElement;
    expect(control.tagName).toBe('INPUT');
  });

  it('shows the requirement pill by default for required fields, hides it for optional', async () => {
    const { rerender } = renderSurface(
      <InlineEditField label="Salary" requirement="required">
        <input />
      </InlineEditField>,
    );
    expect(await screen.findByText('Required')).toBeTruthy();

    rerender(
      <InlineEditField label="Referral source" requirement="optional">
        <input />
      </InlineEditField>,
    );
    expect(screen.queryByText('Optional')).toBeNull();
  });

  it('renders the error message and wires aria-describedby when hasError is set', async () => {
    renderSurface(
      <InlineEditField label="Email" htmlFor="email-input" hasError errorMessage="Enter a valid email.">
        <input id="email-input" />
      </InlineEditField>,
    );

    expect(await screen.findByText('Enter a valid email.')).toBeTruthy();
    const label = screen.getByText('Email');
    expect(label.getAttribute('aria-invalid')).toBe('true');
    expect(label.getAttribute('aria-describedby')).toContain('error');
  });

  it('maps span to the expected grid-column value', async () => {
    const { container } = renderSurface(
      <InlineEditField label="Notes" span="full">
        <textarea />
      </InlineEditField>,
    );
    await screen.findByText('Notes');
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.gridColumn).toBe('1 / -1');
  });
});

describe('InlineEditControl', () => {
  it('applies the full-width style by default', async () => {
    const { container } = renderSurface(
      <InlineEditControl>
        <input aria-label="bounded control" />
      </InlineEditControl>,
    );
    await screen.findByLabelText('bounded control');
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.width).toBe('100%');
  });

  it('applies a distinct style per width variant', async () => {
    const { container, rerender } = renderSurface(
      <InlineEditControl width="natural">
        <input aria-label="bounded control" />
      </InlineEditControl>,
    );
    await screen.findByLabelText('bounded control');
    const naturalRoot = container.firstElementChild as HTMLElement;
    expect(naturalRoot.style.width).toBe('fit-content');

    rerender(
      <InlineEditControl width="full">
        <input aria-label="bounded control" />
      </InlineEditControl>,
    );
    const fullRoot = container.firstElementChild as HTMLElement;
    expect(fullRoot.style.width).toBe('100%');
  });
});

describe('InlineEditGrid', () => {
  it('renders primary content unconditionally', async () => {
    renderSurface(
      <InlineEditGrid kind="primary">
        <div>primary field</div>
      </InlineEditGrid>,
    );
    expect(await screen.findByText('primary field')).toBeTruthy();
  });

  it('unmounts advanced content while collapsed by default', async () => {
    const { container } = renderSurface(
      <InlineEditGrid kind="advanced" expanded={false}>
        <div>advanced field</div>
      </InlineEditGrid>,
    );
    // Nothing text-bearing renders in the collapsed+unmounted case, so wait
    // on the container settling instead of a findBy query.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(container.textContent).toBe('');
    expect(screen.queryByText('advanced field')).toBeNull();
  });

  it('renders advanced content once expanded', async () => {
    renderSurface(
      <InlineEditGrid kind="advanced" expanded>
        <div>advanced field</div>
      </InlineEditGrid>,
    );
    expect(await screen.findByText('advanced field')).toBeTruthy();
  });

  it('keeps advanced content mounted (but hidden) when unmountWhenCollapsed is false', async () => {
    const { container } = renderSurface(
      <InlineEditGrid kind="advanced" expanded={false} unmountWhenCollapsed={false}>
        <div>advanced field</div>
      </InlineEditGrid>,
    );
    expect(await screen.findByText('advanced field')).toBeTruthy();
    expect(container.querySelector('[hidden]')).not.toBeNull();
  });
});

describe('InlineEditSection', () => {
  it('renders the section number, title, and description', async () => {
    renderSurface(
      <InlineEditSection title="Compensation" description="Base pay and bonus structure." sectionNumber="02">
        <div>section body</div>
      </InlineEditSection>,
    );
    expect(await screen.findByText('Section 02')).toBeTruthy();
    expect(screen.getByText('Compensation')).toBeTruthy();
    expect(screen.getByText('section body')).toBeTruthy();
  });
});

describe('MoreFieldsToggle', () => {
  it('calls onToggle and reflects the expanded state via aria-expanded and label', async () => {
    const onToggle = vi.fn();
    const { rerender } = renderSurface(<MoreFieldsToggle expanded={false} onToggle={onToggle} />);

    const collapsedButton = await screen.findByRole('button', { name: 'Show more fields' });
    expect(collapsedButton.getAttribute('aria-expanded')).toBe('false');
    fireEvent.click(collapsedButton);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(<MoreFieldsToggle expanded onToggle={onToggle} />);
    const expandedButton = screen.getByRole('button', { name: 'Hide more fields' });
    expect(expandedButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('docks with position sticky only while expanded and sticky is true', async () => {
    const { container, rerender } = renderSurface(
      <MoreFieldsToggle expanded={false} onToggle={() => {}} sticky />,
    );
    await screen.findByRole('button', { name: 'Show more fields' });
    let root = container.firstElementChild as HTMLElement;
    expect(root.style.position).not.toBe('sticky');

    rerender(<MoreFieldsToggle expanded onToggle={() => {}} sticky stickyOffset={96} />);
    root = container.firstElementChild as HTMLElement;
    expect(root.style.position).toBe('sticky');
    expect(root.style.top).toBe('96px');
  });
});

describe('InlineEditFooter', () => {
  it('fires onCancel and onSave and disables both while isSaving', async () => {
    const onCancel = vi.fn();
    const onSave = vi.fn();
    renderSurface(<InlineEditFooter onCancel={onCancel} onSave={onSave} isSaving />);

    const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
    const saveButton = screen.getByRole('button', { name: 'Save changes' });
    expect(cancelButton.hasAttribute('disabled')).toBe(true);
    expect(saveButton.hasAttribute('disabled')).toBe(true);

    fireEvent.click(cancelButton);
    fireEvent.click(saveButton);
    // Disabled buttons do not fire onClick in the DOM.
    expect(onCancel).not.toHaveBeenCalled();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('prioritizes the error slot over summary and dirtySummary', async () => {
    renderSurface(
      <InlineEditFooter
        summary="3 fields changed"
        dirtySummary="Unsaved changes"
        error="Could not save: network error"
        onCancel={() => {}}
        onSave={() => {}}
      />,
    );

    expect(await screen.findByText('Could not save: network error')).toBeTruthy();
    expect(screen.queryByText('Unsaved changes')).toBeNull();
  });

  it('renders free-form children when no onCancel/onSave handlers are provided', async () => {
    renderSurface(
      <InlineEditFooter>
        <button type="button">Custom action</button>
      </InlineEditFooter>,
    );

    expect(await screen.findByRole('button', { name: 'Custom action' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Save changes' })).toBeNull();
  });
});

describe('full field composition', () => {
  it.each(ENGINES)('renders a primary field plus a collapsed advanced grid under the %s engine', async (engine) => {
    const { container } = renderSurface(
      <InlineEditor title="Member profile" eyebrow="Edit">
        <InlineEditGrid kind="primary">
          <InlineEditField label="Full name" htmlFor="name" span={2}>
            <input id="name" />
          </InlineEditField>
        </InlineEditGrid>
        <InlineEditGrid kind="advanced" expanded={false}>
          <InlineEditField label="Internal notes" htmlFor="notes" requirement="optional">
            <textarea id="notes" />
          </InlineEditField>
        </InlineEditGrid>
        <MoreFieldsToggle expanded={false} onToggle={() => {}} />
      </InlineEditor>,
      { engine },
    );

    expect(await within(container).findByLabelText('Full name')).toBeTruthy();
    expect(within(container).queryByLabelText('Internal notes')).toBeNull();
    expect(await within(container).findByRole('button', { name: 'Show more fields' })).toBeTruthy();
  });
});
