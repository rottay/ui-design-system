/**
 * @fileoverview Runtime contract tests for recently added components.
 * Ensures Callout, Kbd, PasswordInput, TagInput, OTPInput, AspectRatio,
 * ScrollArea, ContextMenu, HoverCard, Sheet, ConfirmDialog, and AlertDialog
 * render their expected content across all stable engines.
 */

import React from 'react';
import { waitFor } from '@testing-library/react';
import { describe, expect } from 'vitest';

import { Callout } from '../../../src/components/primitives/display/callout';
import { Kbd } from '../../../src/components/primitives/display/kbd';
import { OTPInput } from '../../../src/components/primitives/inputs/otp-input';
import { PasswordInput } from '../../../src/components/primitives/inputs/password-input';
import { TagInput } from '../../../src/components/primitives/inputs/tag-input';
import { AspectRatio } from '../../../src/components/primitives/layout/aspect-ratio';
import { ScrollArea } from '../../../src/components/primitives/layout/scroll-area';
import { AlertDialog } from '../../../src/components/primitives/overlay/alert-dialog';
import { ConfirmDialog } from '../../../src/components/primitives/overlay/confirm-dialog';
import { ContextMenu } from '../../../src/components/primitives/overlay/context-menu';
import { HoverCard } from '../../../src/components/primitives/overlay/hover-card';
import { Sheet } from '../../../src/components/primitives/overlay/sheet';
import { itEachEngine, renderWithEngine } from '../../support/engine';

describe('new component runtime contracts', () => {
  itEachEngine('renders Callout', async (engine) => {
    const result = renderWithEngine(
      <Callout title="Heads up">Premium messaging</Callout>,
      engine
    );

    expect(await result.findByText('Heads up')).toBeInTheDocument();
    expect(result.getByText('Premium messaging')).toBeInTheDocument();
  });

  itEachEngine('renders Kbd', async (engine) => {
    const result = renderWithEngine(<Kbd>Cmd</Kbd>, engine);
    expect(await result.findByText('Cmd')).toBeInTheDocument();
  });

  itEachEngine('renders PasswordInput', async (engine) => {
    const result = renderWithEngine(
      <PasswordInput placeholder="Enter password" />,
      engine
    );

    expect(await result.findByPlaceholderText('Enter password')).toBeInTheDocument();
  });

  itEachEngine('renders TagInput', async (engine) => {
    const result = renderWithEngine(
      <TagInput placeholder="Add tag" value={['core']} />,
      engine
    );

    expect(await result.findByText('core')).toBeInTheDocument();
  });

  itEachEngine('renders OTPInput', async (engine) => {
    const result = renderWithEngine(<OTPInput length={4} value="12" />, engine);

    await waitFor(() => {
      expect(result.container.querySelectorAll('input')).toHaveLength(4);
    });
  });

  itEachEngine('renders AspectRatio', async (engine) => {
    const result = renderWithEngine(
      <AspectRatio ratio={16 / 9}>
        <div>Media frame</div>
      </AspectRatio>,
      engine
    );

    expect(await result.findByText('Media frame')).toBeInTheDocument();
  });

  itEachEngine('renders ScrollArea', async (engine) => {
    const result = renderWithEngine(
      <ScrollArea style={{ height: 120 }}>
        <div>Scrollable content</div>
      </ScrollArea>,
      engine
    );

    expect(await result.findByText('Scrollable content')).toBeInTheDocument();
  });

  itEachEngine('renders ContextMenu trigger', async (engine) => {
    const result = renderWithEngine(
      <ContextMenu
        trigger={<button type="button">Open menu</button>}
        items={[{ key: 'copy', label: 'Copy' }]}
      />,
      engine
    );

    expect(await result.findByText('Open menu')).toBeInTheDocument();
  });

  itEachEngine('renders HoverCard content when controlled open', async (engine) => {
    const result = renderWithEngine(
      <HoverCard
        open
        trigger={<button type="button">Hover me</button>}
        content={<div>Hover details</div>}
      />,
      engine
    );

    expect(await result.findByText('Hover me')).toBeInTheDocument();
    expect(await result.findByText('Hover details')).toBeInTheDocument();
  });

  itEachEngine('renders Sheet content when open', async (engine) => {
    const result = renderWithEngine(
      <Sheet open onOpenChange={() => undefined} title="Filters">
        <div>Sheet body</div>
      </Sheet>,
      engine
    );

    expect(await result.findByText('Filters')).toBeInTheDocument();
    expect(await result.findByText('Sheet body')).toBeInTheDocument();
  });

  itEachEngine('renders ConfirmDialog when open', async (engine) => {
    const result = renderWithEngine(
      <ConfirmDialog
        open
        title="Delete event"
        description="This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />,
      engine
    );

    expect(await result.findByText('Delete event')).toBeInTheDocument();
    expect(await result.findByText('Delete')).toBeInTheDocument();
  });

  itEachEngine('renders AlertDialog when open', async (engine) => {
    const result = renderWithEngine(
      <AlertDialog
        open
        title="Archive workspace"
        description="People will lose write access."
        action={<button type="button">Archive</button>}
      />,
      engine
    );

    expect(await result.findByText('Archive workspace')).toBeInTheDocument();
    expect(await result.findByText('Archive')).toBeInTheDocument();
  });
});
