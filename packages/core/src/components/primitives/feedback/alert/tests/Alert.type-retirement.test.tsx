import React, { type ComponentProps } from 'react';
import { cleanup, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { AlertProps as PublishedAlertProps } from '@/index';

import { Alert, type AlertProps } from '..';
import type { AlertProps as EngineAlertProps, AlertTone, AlertType } from '../contracts';
import ClassicAlert from '../engines/classic';
import ModernAlert from '../engines/modern';
import RusticAlert from '../engines/rustic';
import { renderWithEngine } from '@tests/support/engine';

type Declares<Props, Key extends string> = Key extends keyof Props ? true : false;

const RENAMES: ReadonlyArray<readonly [AlertType, AlertTone]> = [
  ['info', 'info'],
  ['success', 'success'],
  ['warning', 'warning'],
  ['error', 'danger'],
];

const FROZEN = [
  ['classic', ClassicAlert],
  ['rustic', RusticAlert],
] as const;

/** React's generated ids are the only per-render values in the markup. */
function markup(ui: React.ReactElement): string {
  const { container } = render(ui);
  const html = container.innerHTML.replace(/[:«]r[0-9a-z]+[:»]|_r_[0-9a-z]+_/g, 'id');
  cleanup();
  return html;
}

describe('Alert public tone contract', () => {
  it('publishes tone and no type on every door', () => {
    const retired: [
      Declares<AlertProps, 'type'>,
      Declares<PublishedAlertProps, 'type'>,
      Declares<ComponentProps<typeof Alert>, 'type'>,
      Declares<ComponentProps<typeof ModernAlert>, 'type'>,
    ] = [false, false, false, false];
    const kept: [
      Declares<AlertProps, 'tone'>,
      Declares<PublishedAlertProps, 'tone'>,
      Declares<EngineAlertProps, 'type'>,
      Declares<ComponentProps<typeof ClassicAlert>, 'type'>,
      Declares<ComponentProps<typeof RusticAlert>, 'type'>,
    ] = [true, true, true, true, true];

    expect(retired.every((declared) => declared === false)).toBe(true);
    expect(kept.every((declared) => declared === true)).toBe(true);
  });

  it('rejects type where an application states it', () => {
    // @ts-expect-error `type` is not a member of the published AlertProps
    const throughRoot: PublishedAlertProps = { message: 'm', type: 'error' };
    // @ts-expect-error `type` is not a prop of the Alert the family publishes
    const throughFacade = <Alert message="m" type="error" />;
    // @ts-expect-error the Modern engine does not declare `type`
    const throughModern = <ModernAlert message="m" type="error" />;
    // @ts-expect-error `error` is not a tone; the tone is `danger`
    const oldValue = <Alert message="m" tone="error" />;
    const engineProps: EngineAlertProps = { message: 'm', type: 'error' };

    expect([throughRoot, throughFacade, throughModern, oldValue].every(Boolean)).toBe(true);
    expect(engineProps.type).toBe('error');
  });
});

describe('Alert tone renders what type rendered', () => {
  it.each(FROZEN.flatMap(([engine, Engine]) => RENAMES.map(([type, tone]) => ({ engine, Engine, type, tone }))))(
    '$engine: tone=$tone equals the engine-internal type=$type',
    ({ Engine, type, tone }) => {
      expect(markup(<Engine tone={tone} message="Heads up" description="Details" />)).toBe(
        markup(<Engine type={type} message="Heads up" description="Details" />),
      );
      expect(markup(<Engine tone={tone} description="Body only" closable showIcon={false} />)).toBe(
        markup(<Engine type={type} description="Body only" closable showIcon={false} />),
      );
    },
  );

  it.each(FROZEN)('%s: no tone equals the engine default', (_engine, Engine) => {
    expect(markup(<Engine message="Heads up" />)).toBe(markup(<Engine tone="info" message="Heads up" />));
  });

  it.each(RENAMES)('modern: the surface key %s is reached through tone=%s', (type, tone) => {
    const { container } = renderWithEngine(<ModernAlert tone={tone} message="Heads up" />, 'modern');
    expect(container.querySelector('[data-part="root"]')).toHaveAttribute('data-tone', type);
  });

  it('modern: no tone equals tone="info"', () => {
    expect(markup(<ModernAlert message="Heads up" description="Details" />)).toBe(
      markup(<ModernAlert tone="info" message="Heads up" description="Details" />),
    );
  });
});
