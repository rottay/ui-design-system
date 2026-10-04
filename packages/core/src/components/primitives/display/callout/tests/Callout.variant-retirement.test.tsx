import React, { type ComponentProps } from 'react';
import { cleanup, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CalloutProps as PublishedCalloutProps } from '@/index';
// @ts-expect-error the package root does not publish `CalloutVariant`; `CalloutTone` types the `tone` prop
import type { CalloutVariant } from '@/index';

import { Callout, type CalloutProps, type CalloutTone } from '..';
import type { CalloutColorKey, CalloutProps as EngineCalloutProps } from '../contracts';
import ClassicCallout from '../engines/classic';
import RusticCallout from '../engines/rustic';
import ModernCallout from '../../../feedback/alert/presentation/callout';
import { renderWithEngine } from '@tests/support/engine';

type Declares<Props, Key extends string> = Key extends keyof Props ? true : false;

const RENAMES: ReadonlyArray<readonly [CalloutColorKey, CalloutTone]> = [
  ['info', 'info'],
  ['success', 'success'],
  ['warning', 'warning'],
  ['error', 'danger'],
];

const FROZEN = [
  ['classic', ClassicCallout],
  ['rustic', RusticCallout],
] as const;

function markup(ui: React.ReactElement): string {
  const { container } = render(ui);
  const html = container.innerHTML.replace(/[:«]r[0-9a-z]+[:»]|_r_[0-9a-z]+_/g, 'id');
  cleanup();
  return html;
}

describe('Callout public tone contract', () => {
  it('publishes tone and no variant on every door', () => {
    const retired: [
      Declares<CalloutProps, 'variant'>,
      Declares<PublishedCalloutProps, 'variant'>,
      Declares<ComponentProps<typeof Callout>, 'variant'>,
      Declares<ComponentProps<typeof ModernCallout>, 'variant'>,
    ] = [false, false, false, false];
    const kept: [
      Declares<CalloutProps, 'tone'>,
      Declares<PublishedCalloutProps, 'tone'>,
      Declares<EngineCalloutProps, 'variant'>,
      Declares<ComponentProps<typeof ClassicCallout>, 'variant'>,
      Declares<ComponentProps<typeof RusticCallout>, 'variant'>,
    ] = [true, true, true, true, true];

    expect(retired.every((declared) => declared === false)).toBe(true);
    expect(kept.every((declared) => declared === true)).toBe(true);
  });

  it('rejects variant where an application states it', () => {
    // @ts-expect-error `variant` is not a member of the published CalloutProps
    const throughRoot: PublishedCalloutProps = { children: 'm', variant: 'error' };
    // @ts-expect-error `variant` is not a prop of the Callout the family publishes
    const throughFacade = <Callout variant="error">m</Callout>;
    // @ts-expect-error the Modern presentation does not declare `variant`
    const throughModern = <ModernCallout variant="error">m</ModernCallout>;
    // @ts-expect-error `error` is not a tone; the tone is `danger`
    const oldValue = <Callout tone="error">m</Callout>;
    const retiredName: CalloutVariant | undefined = undefined;
    const engineProps: EngineCalloutProps = { children: 'm', variant: 'error' };

    expect([throughRoot, throughFacade, throughModern, oldValue].every(Boolean)).toBe(true);
    expect(retiredName).toBeUndefined();
    expect(engineProps.variant).toBe('error');
  });
});

describe('Callout tone renders what variant rendered', () => {
  it.each(FROZEN.flatMap(([engine, Engine]) => RENAMES.map(([variant, tone]) => ({ engine, Engine, variant, tone }))))(
    '$engine: tone=$tone equals the engine-internal variant=$variant',
    ({ Engine, variant, tone }) => {
      expect(
        markup(
          <Engine tone={tone} title="Heads up" closable action={<button type="button">Review</button>}>
            Body copy
          </Engine>,
        ),
      ).toBe(
        markup(
          <Engine variant={variant} title="Heads up" closable action={<button type="button">Review</button>}>
            Body copy
          </Engine>,
        ),
      );
      expect(markup(<Engine tone={tone}>Body only</Engine>)).toBe(markup(<Engine variant={variant}>Body only</Engine>));
    },
  );

  it.each(FROZEN)('%s: no tone equals the engine default', (_engine, Engine) => {
    expect(markup(<Engine title="Heads up">Body copy</Engine>)).toBe(
      markup(<Engine tone="info" title="Heads up">Body copy</Engine>),
    );
  });

  it.each(RENAMES)('modern: the surface key %s is reached through tone=%s', (variant, tone) => {
    const { container } = renderWithEngine(<ModernCallout tone={tone} title="Heads up">Body copy</ModernCallout>, 'modern');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-tone', variant);
  });

  it('modern: a variant that arrives untyped is not read', () => {
    const untyped = { variant: 'error' };
    const { container } = renderWithEngine(<ModernCallout {...untyped}>Body copy</ModernCallout>, 'modern');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-tone', 'info');
  });
});
