/**
 * Alert owns everything the folded Callout renders on the Modern engine.
 *
 * `<Callout tone title icon closable action>{body}</Callout>` is
 * `<Alert tone message={title} description={body} icon closable action
 * emphasis="subtle" announce="tone" />`: same anatomy, same attributes, same
 * live-region role. An Alert that names neither new prop renders exactly what
 * it rendered before they existed.
 *
 * Dismiss identity is NOT the same, and this file pins the difference: Callout
 * keys a dismissal on its body alone, Alert on its message and description
 * together. Every change that re-opens a Callout re-opens its Alert rewrite;
 * a title change re-opens the Alert where the Callout stays shut.
 */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Alert } from '..';
import { Callout } from '../../../display/callout';
import ModernAlert from '../engines/modern';
import ModernCallout from '../presentation/callout';
import { ALERT_DEFAULTS } from '../contracts';
import { renderWithEngine } from '@tests/support/engine';

const TONES = ['info', 'success', 'warning', 'danger'] as const;
const FLAGS = [false, true] as const;

/** The generated title id is the only per-instance value in the markup. */
const normalizeTitleId = (html: string): string => html.replace(/(id|aria-describedby)="[^"]*"/g, '$1="title-id"');

function markup(ui: React.ReactElement): string {
  const { container } = render(ui);
  const html = container.innerHTML;
  cleanup();
  return normalizeTitleId(html);
}

function attributesOf(element: Element): Record<string, string> {
  return Object.fromEntries(Array.from(element.attributes, (attribute) => [attribute.name, attribute.value]));
}

const COMBINATIONS = TONES.flatMap((tone) =>
  FLAGS.flatMap((titled) =>
    FLAGS.flatMap((closable) =>
      FLAGS.flatMap((withAction) =>
        FLAGS.map((withIcon) => ({ tone, titled, closable, withAction, withIcon })),
      ),
    ),
  ),
);

describe('Alert renders what the folded Callout renders', () => {
  it.each(COMBINATIONS)(
    'tone=$tone titled=$titled closable=$closable action=$withAction icon=$withIcon',
    ({ tone, titled, closable, withAction, withIcon }) => {
      const title = titled ? 'Decision ready' : undefined;
      const action = withAction ? <button type="button">Review</button> : undefined;
      const icon = withIcon ? <svg data-testid="custom-icon" /> : undefined;

      const callout = markup(
        <ModernCallout tone={tone} title={title} closable={closable} action={action} icon={icon}>
          Evidence is complete.
        </ModernCallout>,
      );
      const alert = markup(
        <ModernAlert
          tone={tone}
          message={title}
          description="Evidence is complete."
          closable={closable}
          action={action}
          icon={icon}
          emphasis="subtle"
          announce="tone"
        />,
      );

      expect(alert).toBe(callout);
      expect(alert).toContain(`role="${tone === 'warning' || tone === 'danger' ? 'alert' : 'status'}"`);
      expect(alert).toContain('data-emphasis="subtle"');
    },
  );

  it('carries className, style and a composed body through unchanged', () => {
    const body = (
      <>
        Renew the <strong>certificate</strong> first.
      </>
    );
    const callout = markup(
      <ModernCallout tone="warning" className="billing-notice" style={{ marginBlockEnd: 16 }}>
        {body}
      </ModernCallout>,
    );
    const alert = markup(
      <ModernAlert
        tone="warning"
        description={body}
        className="billing-notice"
        style={{ marginBlockEnd: 16 }}
        emphasis="subtle"
        announce="tone"
      />,
    );

    expect(alert).toBe(callout);
  });

  it('escalates the announcement when the tone turns urgent, as the callout does', () => {
    const { rerender } = render(<ModernAlert tone="info" description="Retrying" announce="tone" />);
    expect(screen.getByRole('status')).toHaveAttribute('data-tone', 'info');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<ModernAlert tone="danger" description="Failed" announce="tone" />);
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'error');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('the public Alert renders what the public Callout renders', () => {
  it.each(TONES)('matches through the engine factory for tone=%s', async (tone) => {
    const role = tone === 'warning' || tone === 'danger' ? 'alert' : 'status';

    renderWithEngine(
      <Callout tone={tone} title="Decision ready" closable action={<button type="button">Review</button>}>
        Evidence is complete.
      </Callout>,
      'modern',
    );
    const callout = normalizeTitleId((await screen.findByRole(role)).outerHTML);
    cleanup();

    renderWithEngine(
      <Alert
        tone={tone}
        message="Decision ready"
        description="Evidence is complete."
        closable
        action={<button type="button">Review</button>}
        emphasis="subtle"
        announce="tone"
      />,
      'modern',
    );
    const alert = normalizeTitleId((await screen.findByRole(role)).outerHTML);

    expect(alert).toBe(callout);
    expect(alert).toContain('data-emphasis="subtle"');
  });

  it('matches through the engine factory for a body-only notice', async () => {
    renderWithEngine(<Callout tone="info">Evidence is complete.</Callout>, 'modern');
    const callout = (await screen.findByRole('status')).outerHTML;
    cleanup();

    renderWithEngine(<Alert tone="info" description="Evidence is complete." emphasis="subtle" announce="tone" />, 'modern');
    const alert = (await screen.findByRole('status')).outerHTML;

    expect(alert).toBe(callout);
    expect(alert).not.toContain('data-part="title"');
  });
});

describe('the dismiss identity differs between Callout and its Alert rewrite', () => {
  const dismiss = () => fireEvent.click(screen.getByRole('button', { name: 'Close' }));

  it('re-opens both when the body changes under a static title', () => {
    const callout = render(
      <ModernCallout title="Upload failed" closable>
        The file is too large.
      </ModernCallout>,
    );
    dismiss();
    callout.rerender(
      <ModernCallout title="Upload failed" closable>
        The network is unreachable.
      </ModernCallout>,
    );
    expect(screen.getByText('The network is unreachable.')).toBeInTheDocument();
    cleanup();

    const alert = render(
      <ModernAlert message="Upload failed" description="The file is too large." closable emphasis="subtle" announce="tone" />,
    );
    dismiss();
    alert.rerender(
      <ModernAlert message="Upload failed" description="The network is unreachable." closable emphasis="subtle" announce="tone" />,
    );
    expect(screen.getByText('The network is unreachable.')).toBeInTheDocument();
  });

  it('keeps the Callout shut when only its title changes', () => {
    const { rerender } = render(
      <ModernCallout title="Upload failed" closable>
        Try again later.
      </ModernCallout>,
    );
    dismiss();
    rerender(
      <ModernCallout title="Sync failed" closable>
        Try again later.
      </ModernCallout>,
    );

    expect(screen.queryByText('Sync failed')).toBeNull();
    expect(screen.queryByText('Try again later.')).toBeNull();
  });

  it('re-opens the Alert rewrite when only its message changes', () => {
    const { rerender } = render(
      <ModernAlert message="Upload failed" description="Try again later." closable emphasis="subtle" announce="tone" />,
    );
    dismiss();
    rerender(
      <ModernAlert message="Sync failed" description="Try again later." closable emphasis="subtle" announce="tone" />,
    );

    expect(screen.getByText('Sync failed')).toBeInTheDocument();
    expect(screen.getByText('Try again later.')).toBeInTheDocument();
  });

  it('keeps the Callout shut when its title changes over a composed body', () => {
    const { rerender } = render(
      <ModernCallout title="Upload failed" closable>
        <strong>Composed node.</strong>
      </ModernCallout>,
    );
    dismiss();
    rerender(
      <ModernCallout title="Sync failed" closable>
        <strong>Composed node.</strong>
      </ModernCallout>,
    );

    expect(screen.queryByText('Composed node.')).toBeNull();
  });

  it('re-opens the Alert rewrite when its message changes over a composed body', () => {
    const { rerender } = render(
      <ModernAlert message="Upload failed" description={<strong>Composed node.</strong>} closable />,
    );
    dismiss();
    rerender(<ModernAlert message="Sync failed" description={<strong>Composed node.</strong>} closable />);

    expect(screen.getByText('Composed node.')).toBeInTheDocument();
  });
});

describe('an alert always says something', () => {
  it('accepts a message, a description, or both', () => {
    const valid = [
      <ModernAlert key="message" message="Saved" />,
      <ModernAlert key="both" message="Saved" description="Your profile is up to date." />,
      <ModernAlert key="body" description="Your profile is up to date." />,
      <Alert key="public-message" message="Saved" />,
      <Alert key="public-body" description="Your profile is up to date." />,
    ];

    expect(valid).toHaveLength(5);
  });

  it('refuses an alert with neither a message nor a description', () => {
    const refused = [
      // @ts-expect-error an alert needs a message or a description
      <ModernAlert key="engine" />,
      // @ts-expect-error an alert needs a message or a description
      <ModernAlert key="engine-props" tone="warning" closable />,
      // @ts-expect-error an alert needs a message or a description
      <Alert key="public" />,
      // @ts-expect-error an alert needs a message or a description
      <Alert key="public-props" tone="warning" closable />,
    ];

    expect(refused).toHaveLength(4);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty string', ''],
  ] as const)('renders nothing when the only content is %s', (_label, message) => {
    const { container } = render(<ModernAlert tone="danger" message={message} closable />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('still renders when an action or compound children are the only content', () => {
    render(<ModernAlert message={undefined} action={<button type="button">Retry</button>} />);
    expect(screen.getByRole('alert')).toContainElement(screen.getByRole('button', { name: 'Retry' }));
    cleanup();

    render(
      <ModernAlert message={undefined}>
        <span>Compound detail</span>
      </ModernAlert>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Compound detail');
  });
});

describe('Alert dismiss identity covers the body the callout keys on', () => {
  it('re-opens a body-only notice when its body changes', () => {
    const { rerender } = render(<ModernAlert description="First message." closable />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('First message.')).toBeNull();

    rerender(<ModernAlert description="Second message." closable />);
    expect(screen.getByText('Second message.')).toBeInTheDocument();
  });

  it('re-opens when the body changes under a static title', () => {
    const { rerender } = render(
      <ModernAlert tone="danger" message="Upload failed" description="The file is too large." closable />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    rerender(<ModernAlert tone="danger" message="Upload failed" description="The network is unreachable." closable />);
    expect(screen.getByRole('alert')).toHaveTextContent('The network is unreachable.');
  });

  it('stays dismissed while the same title and body re-render', () => {
    const { rerender } = render(<ModernAlert message="Upload failed" description="The file is too large." closable />);

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    rerender(<ModernAlert message="Upload failed" description="The file is too large." closable />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('stays dismissed when neither the title nor the body is primitive', () => {
    const { rerender } = render(
      <ModernAlert message={<span>Title node</span>} description={<strong>Composed node.</strong>} closable />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    rerender(<ModernAlert message={<span>Title node</span>} description={<strong>Composed node.</strong>} closable />);

    expect(screen.queryByText('Composed node.')).toBeNull();
  });
});

describe('an Alert that names neither new prop is the Alert it was', () => {
  it('defaults to the standard weight and the assertive announcement', () => {
    expect(ALERT_DEFAULTS.emphasis).toBe('standard');
    expect(ALERT_DEFAULTS.announce).toBe('alert');
  });

  it.each(TONES)('keeps the %s root on role=alert with the attribute set it always had', (tone) => {
    const { container } = render(<ModernAlert tone={tone} message="Review pending" description="Two approvals." />);
    const type = tone === 'danger' ? 'error' : tone;

    expect(attributesOf(container.firstElementChild!)).toEqual({
      'data-part': 'root',
      'data-tone': type,
      'data-compact': 'false',
      'data-has-icon': 'true',
      class: 'ds-alert ds-alert--modern',
      role: 'alert',
    });
  });

  it('renders the same markup whether the defaults are implied or spelled out', () => {
    const implied = markup(
      <ModernAlert tone="warning" message="Review pending" description="Two approvals." closable action={<a href="#review">Review</a>} />,
    );
    const explicit = markup(
      <ModernAlert
        tone="warning"
        message="Review pending"
        description="Two approvals."
        closable
        action={<a href="#review">Review</a>}
        emphasis="standard"
        announce="alert"
      />,
    );

    expect(explicit).toBe(implied);
    expect(implied).not.toContain('data-emphasis');
  });

  it('keeps a calm tone assertive unless the caller asks otherwise', () => {
    render(<ModernAlert tone="success" message="Saved" />);

    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'success');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('announces politely on request without changing the weight', () => {
    render(<ModernAlert tone="danger" message="Sync paused" announce="status" />);

    const root = screen.getByRole('status');
    expect(root).toHaveAttribute('data-tone', 'error');
    expect(root).not.toHaveAttribute('data-emphasis');
  });

  it('washes subtly on request without changing the announcement', () => {
    render(<ModernAlert tone="info" message="Tip" emphasis="subtle" />);

    expect(screen.getByRole('alert')).toHaveAttribute('data-emphasis', 'subtle');
  });
});
