import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { FileManagerPathSegment, PatternFileManagerProps } from '../contracts';
import { I18nProvider } from '@/infrastructure/runtime/i18n';

import ModernFileManager from '../engines/modern';

/** The current folder's own children only: ancestors are never listed, though one may share a child's name. */
function createProps(overrides: Partial<PatternFileManagerProps> = {}): PatternFileManagerProps {
  return {
    files: [{ id: 'f1', name: 'q3.pdf', type: 'file', mimeType: 'application/pdf', size: 1024 }],
    folders: [{ id: 'fld_child', name: 'Drafts', type: 'folder' }],
    ...overrides,
  };
}

const trail = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>('[data-part="breadcrumb"] [data-part="crumb"]'));

const crumbButton = (name: string) => {
  const nav = screen.getByRole('navigation');
  return within(nav).getByRole('button', { name });
};

function expectRefusal(ui: React.ReactElement, message: string) {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  try {
    expect(() => render(ui)).toThrow(message);
  } finally {
    consoleError.mockRestore();
  }
}

afterEach(cleanup);

describe('ModernFileManager path segments: positive', () => {
  it('hands an object ancestor crumb its supplied id, which no listed folder carries', () => {
    const onNavigate = vi.fn();
    const path: FileManagerPathSegment[] = [
      { id: 'fld_9f2', name: 'Documents' },
      { id: 'fld_a71', name: 'Reports' },
    ];
    render(<ModernFileManager {...createProps({ currentPath: path, onNavigate })} />);

    fireEvent.click(crumbButton('Documents'));

    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('fld_9f2');
    expect(onNavigate).not.toHaveBeenCalledWith('Documents');
  });

  it('renders the names as labels in root-first order with the last segment current and inert', () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <ModernFileManager
        {...createProps({
          currentPath: [{ id: 'fld_9f2', name: 'Documents' }, { id: 'fld_a71', name: 'Reports' }],
          onNavigate,
        })}
      />
    );

    const crumbs = trail(container);
    expect(crumbs.map((crumb) => crumb.textContent)).toEqual(['Root', 'Documents', 'Reports']);
    expect(crumbs.map((crumb) => crumb.textContent)).not.toContain('fld_9f2');
    const current = crumbs[crumbs.length - 1];
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current.tagName).toBe('SPAN');
    fireEvent.click(current);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('keeps Root on its own null contract next to object segments', () => {
    const onNavigate = vi.fn();
    render(<ModernFileManager {...createProps({ currentPath: [{ id: 'fld_9f2', name: 'Documents' }], onNavigate })} />);

    fireEvent.click(crumbButton('Root'));

    expect(onNavigate).toHaveBeenCalledWith(null);
  });

  it('lets each element of a mixed path keep its own behaviour', () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <ModernFileManager
        {...createProps({
          currentPath: ['Workspace', { id: 'fld_a71', name: 'Reports' }, 'Q3'],
          onNavigate,
        })}
      />
    );

    expect(trail(container).map((crumb) => crumb.textContent)).toEqual(['Root', 'Workspace', 'Reports', 'Q3']);
    fireEvent.click(crumbButton('Workspace'));
    fireEvent.click(crumbButton('Reports'));
    expect(onNavigate.mock.calls).toEqual([['Workspace'], ['fld_a71']]);
  });

  it('keeps a deprecated string-only path on its previous behaviour', () => {
    const onNavigate = vi.fn();
    render(<ModernFileManager {...createProps({ currentPath: ['Documents', 'Reports'], onNavigate })} />);

    fireEvent.click(crumbButton('Documents'));

    expect(onNavigate).toHaveBeenCalledWith('Documents');
  });
});

describe('ModernFileManager path segments: no lookup in folders', () => {
  /** A listed child folder whose name equals an ancestor crumb's label. */
  const listedDrafts = [{ id: 'fld_child', name: 'Drafts', type: 'folder' as const }];

  const listedFolderLink = (container: HTMLElement, name: string) => {
    const links = Array.from(container.querySelectorAll<HTMLElement>('[data-action="navigate-folder"]'));
    const link = links.find((candidate) => candidate.textContent === name);
    if (!link) throw new Error(`no listed folder link named ${name}`);
    return link;
  };

  it('hands an ancestor segment its supplied id when a listed child folder has the same name', () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <ModernFileManager
        {...createProps({
          folders: listedDrafts,
          currentPath: [
            { id: 'fld_anc', name: 'Drafts' },
            { id: 'fld_leaf', name: 'Q3' },
          ],
          onNavigate,
        })}
      />
    );

    fireEvent.click(listedFolderLink(container, 'Drafts'));
    expect(onNavigate.mock.calls).toEqual([['fld_child']]);
    onNavigate.mockClear();

    fireEvent.click(crumbButton('Drafts'));
    expect(onNavigate.mock.calls).toEqual([['fld_anc']]);
    expect(onNavigate).not.toHaveBeenCalledWith('fld_child');
  });

  it('hands a deprecated string ancestor the string itself when a listed child folder has the same name', () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <ModernFileManager {...createProps({ folders: listedDrafts, currentPath: ['Drafts', 'Q3'], onNavigate })} />
    );

    fireEvent.click(listedFolderLink(container, 'Drafts'));
    expect(onNavigate.mock.calls).toEqual([['fld_child']]);
    onNavigate.mockClear();

    fireEvent.click(crumbButton('Drafts'));
    expect(onNavigate.mock.calls).toEqual([['Drafts']]);
    expect(onNavigate).not.toHaveBeenCalledWith('fld_child');
  });
});

describe('ModernFileManager path segments: collisions and keys', () => {
  it('sends each of two same-named ancestors its own id', () => {
    const onNavigate = vi.fn();
    render(
      <ModernFileManager
        {...createProps({
          currentPath: [
            { id: 'fld_r1', name: 'Reports' },
            { id: 'fld_r2', name: 'Reports' },
            { id: 'fld_leaf', name: 'Q3' },
          ],
          onNavigate,
        })}
      />
    );

    const [outer, inner] = within(screen.getByRole('navigation')).getAllByRole('button', { name: 'Reports' });
    fireEvent.click(outer);
    fireEvent.click(inner);
    expect(onNavigate.mock.calls).toEqual([['fld_r1'], ['fld_r2']]);
  });

  it('keeps every ancestor interactive and exactly one crumb current when ids repeat', () => {
    const onNavigate = vi.fn();
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { container } = render(
        <ModernFileManager
          {...createProps({
            currentPath: [
              { id: 'fld_same', name: 'Alpha' },
              { id: 'fld_same', name: 'Beta' },
              { id: 'fld_same', name: 'Gamma' },
            ],
            onNavigate,
          })}
        />
      );

      const crumbs = trail(container);
      expect(crumbs.filter((crumb) => crumb.getAttribute('aria-current') === 'page')).toHaveLength(1);
      expect(crumbs[crumbs.length - 1]).toHaveTextContent('Gamma');
      fireEvent.click(crumbButton('Alpha'));
      fireEvent.click(crumbButton('Beta'));
      expect(onNavigate.mock.calls).toEqual([['fld_same'], ['fld_same']]);
      expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i);
    } finally {
      consoleError.mockRestore();
    }
  });

  it('accepts a segment whose id is the literal Root key without becoming Root', () => {
    const onNavigate = vi.fn();
    render(
      <ModernFileManager
        {...createProps({
          currentPath: [{ id: '__root__', name: 'Imported' }, { id: 'fld_leaf', name: 'Leaf' }],
          onNavigate,
        })}
      />
    );

    fireEvent.click(crumbButton('Imported'));
    fireEvent.click(crumbButton('Root'));
    expect(onNavigate.mock.calls).toEqual([['__root__'], [null]]);
  });
});

describe('ModernFileManager path segments: keyboard and reading direction', () => {
  it('activates an object ancestor crumb from the keyboard with Enter and Space', async () => {
    const user = userEvent.setup();
    const onNavigate = vi.fn();
    render(
      <ModernFileManager
        {...createProps({
          currentPath: [{ id: 'fld_9f2', name: 'Documents' }, { id: 'fld_a71', name: 'Reports' }],
          onNavigate,
        })}
      />
    );

    const documents = crumbButton('Documents');
    expect(documents.tagName).toBe('BUTTON');
    documents.focus();
    await user.keyboard('{Enter}');
    await user.keyboard(' ');
    expect(onNavigate.mock.calls).toEqual([['fld_9f2'], ['fld_9f2']]);
  });

  it('reaches the ancestor crumbs with Tab in reading order', async () => {
    const user = userEvent.setup();
    render(
      <ModernFileManager
        {...createProps({
          currentPath: [{ id: 'fld_9f2', name: 'Documents' }, { id: 'fld_a71', name: 'Reports' }],
          onNavigate: vi.fn(),
        })}
      />
    );

    await user.tab();
    expect(crumbButton('Root')).toHaveFocus();
    await user.tab();
    expect(crumbButton('Documents')).toHaveFocus();
  });

  it('keeps the root-first trail and the supplied id under an RTL locale', () => {
    const onNavigate = vi.fn();
    const { container } = render(
      <I18nProvider locale="ar" fallbackLocale="en">
        <ModernFileManager
          {...createProps({
            currentPath: [{ id: 'fld_9f2', name: 'مستندات' }, { id: 'fld_a71', name: 'تقارير' }],
            onNavigate,
          })}
        />
      </I18nProvider>
    );

    const labels = trail(container).map((crumb) => crumb.textContent);
    expect(labels.slice(1)).toEqual(['مستندات', 'تقارير']);
    fireEvent.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'مستندات' }));
    expect(onNavigate).toHaveBeenCalledWith('fld_9f2');
  });
});

describe('ModernFileManager path segments: refusals', () => {
  it('refuses an ancestor with an empty id before any crumb can navigate', () => {
    const onNavigate = vi.fn();
    expectRefusal(
      <ModernFileManager
        {...createProps({ currentPath: [{ id: '', name: 'Documents' }, { id: 'fld_a71', name: 'Reports' }], onNavigate })}
      />,
      'PatternFileManager: currentPath[0] is a FileManagerPathSegment with an empty `id`'
    );
    expect(onNavigate).not.toHaveBeenCalled();
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('refuses an empty id on the current segment too', () => {
    expectRefusal(
      <ModernFileManager {...createProps({ currentPath: [{ id: 'fld_9f2', name: 'Documents' }, { id: '', name: 'Reports' }] })} />,
      'currentPath[1] is a FileManagerPathSegment with an empty `id`'
    );
  });

  it('refuses an empty id while loading as well', () => {
    expectRefusal(
      <ModernFileManager {...createProps({ loading: true, currentPath: [{ id: '', name: 'Documents' }] })} />,
      'currentPath[0] is a FileManagerPathSegment with an empty `id`'
    );
  });

  it('refuses a deserialized element that is neither a string nor a segment', () => {
    const fromWire: PatternFileManagerProps['currentPath'] = JSON.parse('[{"name":"Documents"},"Reports"]');
    expectRefusal(
      <ModernFileManager {...createProps({ currentPath: fromWire })} />,
      'currentPath[0] is neither a string nor a FileManagerPathSegment'
    );
  });

  it('refuses a deserialized null element instead of rendering an empty crumb', () => {
    const fromWire: PatternFileManagerProps['currentPath'] = JSON.parse('["Documents",null]');
    expectRefusal(
      <ModernFileManager {...createProps({ currentPath: fromWire })} />,
      'currentPath[1] is neither a string nor a FileManagerPathSegment'
    );
  });
});
