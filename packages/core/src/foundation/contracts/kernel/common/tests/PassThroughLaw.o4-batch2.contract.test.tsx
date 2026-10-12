/**
 * Pass-through law contract (P-88) for the tail families whose part and state
 * held sets are empty: Image and its compound parts, List, Menu and its
 * compound parts, Stepper and its compound parts, and Textarea. A caller
 * `data-part`/`data-state` reaches no element they paint and the owner's own
 * part survives; every other `data-*` and `className` keep forwarding (the
 * honesty law).
 */
import React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { ImageFallback } from '@/components/primitives/display/image/compound/fallback';
import { ImageSkeleton } from '@/components/primitives/display/image/compound/skeleton';
import ModernImage from '@/components/primitives/display/image/engines/modern';
import ModernList, { Item as ListItem, Meta as ListItemMeta } from '@/components/primitives/display/list/engines/modern';
import ModernTextarea from '@/components/primitives/inputs/textarea/engines/modern';
import RusticTextarea from '@/components/primitives/inputs/textarea/engines/rustic';
import { MenuDivider } from '@/components/primitives/navigation/menu/compound/divider';
import { MenuGroup } from '@/components/primitives/navigation/menu/compound/group';
import { MenuItem } from '@/components/primitives/navigation/menu/compound/item';
import { MenuSubMenu } from '@/components/primitives/navigation/menu/compound/sub-menu';
import ModernMenu from '@/components/primitives/navigation/menu/engines/modern';
import { StepperContent } from '@/components/primitives/navigation/stepper/compound/content';
import { StepperStep } from '@/components/primitives/navigation/stepper/compound/step';
import ModernStepper from '@/components/primitives/navigation/stepper/engines/modern';
import { renderWithEngine } from '@tests/support/engine';

const CALLER_PART = 'p88-caller-part';
const CALLER_STATE = 'p88-caller-state';

const caller = {
  'data-custom': 'caller-data',
  className: 'caller-hook',
  'data-part': CALLER_PART,
  'data-state': CALLER_STATE,
} as const;

describe('P-88 pass-through law: Image, List, Menu, Stepper and Textarea', () => {
  it.each([
    ['Image', 'modern', <ModernImage key="image" src="/p.jpg" alt="Photo" {...caller} />, ".rottay-image--modern[data-part='root']"],
    ['Image fallback', 'modern', <ImageFallback key="image-fallback" {...caller} />, ".rottay-image-fallback[data-part='fallback']"],
    ['Image skeleton', 'modern', <ImageSkeleton key="image-skeleton" {...caller} />, ".rottay-image-skeleton[data-part='skeleton']"],
    ['List', 'modern', <ModernList key="list" {...caller}><ListItem>Row</ListItem></ModernList>, ".caller-hook[data-part='root']"],
    ['List (loading)', 'modern', <ModernList key="list-loading" loading {...caller}><ListItem>Row</ListItem></ModernList>, ".caller-hook[data-part='root']"],
    ['List item', 'modern', <ul key="list-item"><ListItem {...caller}>Row</ListItem></ul>, "li.caller-hook[data-part='item']"],
    ['List item meta', 'modern', <ListItemMeta key="list-meta" title="Title" {...caller} />, ".caller-hook[data-part='meta']"],
    ['Menu', 'modern', <ModernMenu key="menu" items={[{ key: 'a', label: 'Alpha' }]} {...caller} />, ".ds-menu--modern[data-part='root']"],
    ['Menu divider', 'modern', <ul key="menu-divider"><MenuDivider {...caller} /></ul>, "li.caller-hook[data-part='divider']"],
    ['Menu group', 'modern', <ul key="menu-group"><MenuGroup title="Group" {...caller}><li>Row</li></MenuGroup></ul>, "li.caller-hook[data-part='group']"],
    ['Menu item', 'modern', <ul key="menu-item"><MenuItem itemKey="a" {...caller}>Alpha</MenuItem></ul>, "li.ds-menu-item.caller-hook[data-part='item']"],
    ['Menu submenu', 'modern', <ul key="menu-submenu"><MenuSubMenu itemKey="s" title="More" {...caller}><li>Row</li></MenuSubMenu></ul>, 'li.ds-menu-submenu.caller-hook:not([data-part])'],
    ['Stepper content', 'modern', <StepperContent key="stepper-content" stepIndex={0} currentStep={0} {...caller}>Panel</StepperContent>, ".ds-stepper-content.caller-hook[data-part='panel']"],
    ['Textarea', 'modern', <ModernTextarea key="textarea-modern" {...caller} />, "textarea.ds-textarea--modern[data-part='root']"],
    ['Textarea', 'rustic', <RusticTextarea key="textarea-rustic" {...caller} />, "textarea[data-part='root']"],
  ] as const)('%s (%s) drops the caller part and state, keeps its own anatomy and still forwards data-* and className', (_family, engine, ui, ownAnatomy) => {
    const { container } = renderWithEngine(ui, engine);

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state~="${CALLER_STATE}"]`)).toBeNull();
    expect(container.querySelector(ownAnatomy)).toBeTruthy();

    expect(container.querySelector('[data-custom="caller-data"]')).toBeTruthy();
    expect(container.querySelector('.caller-hook')).toBeTruthy();
  });

  // The stepper's passthrough lands on its unpainted <nav> wrapper, which
  // carries no part; the painted <ul> keeps its own root part.
  it('Stepper (modern) drops the caller part, keeps its own root part and still forwards data-* and className', () => {
    const { container } = renderWithEngine(
      <ModernStepper items={[{ title: 'One' }, { title: 'Two' }]} {...caller} />,
      'modern',
    );

    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(".ds-stepper--modern[data-part='root']")).toBeTruthy();
    expect(container.querySelector(".ds-stepper--modern")).not.toHaveAttribute('data-state', CALLER_STATE);
    expect(container.querySelector('nav.caller-hook[data-custom="caller-data"]:not([data-part])')).toBeTruthy();
  });

  it('Stepper step never surfaces a caller part or state, at rest or pressed', () => {
    const { container } = renderWithEngine(
      <StepperStep title="One" onClick={() => {}} {...caller} />,
      'modern',
    );
    const step = container.querySelector<HTMLElement>('.ds-stepper-step.caller-hook')!;

    expect(step).toHaveAttribute('data-part', 'item');
    expect(step).toHaveAttribute('data-custom', 'caller-data');
    expect(container.querySelector(`[data-part="${CALLER_PART}"]`)).toBeNull();
    expect(container.querySelector(`[data-state~="${CALLER_STATE}"]`)).toBeNull();

    fireEvent.pointerDown(step);
    expect(step.getAttribute('data-state')?.split(' ')).toContain('pressed');
    expect(container.querySelector(`[data-state~="${CALLER_STATE}"]`)).toBeNull();
  });
});
