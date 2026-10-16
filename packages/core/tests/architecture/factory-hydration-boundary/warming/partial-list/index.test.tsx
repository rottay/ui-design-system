/**
 * @fileoverview A list found before its text has finished streaming in.
 *
 * Text that does not parse while the document is still loading is a pending
 * list, not an empty one: it is re-read when the text completes, at the
 * latest on `DOMContentLoaded`. After loading, unparseable text reads as
 * empty, once, and nothing re-arms.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RENDERED_FAMILIES_CHANNEL } from '@/infrastructure/runtime/engines/composition/react/rendered-families';
import { createEngineComponent } from '@/infrastructure/runtime/engines/presentation/component-factory';

import { mountHtml, settle } from '../../harness';

type LabelProps = { label: string };
const Label = ({ label }: LabelProps) => <span>{label}</span>;

function loader() {
  return vi.fn(async () => ({ default: Label }));
}

function family(name: string, modern = loader()) {
  createEngineComponent<LabelProps>(name, { classic: null, rustic: null, modern });
  return modern;
}

function listNode(text: string): Element {
  const container = mountHtml('<script type="application/json" data-ds-rendered-families></script>');
  const node = container.querySelector('script[data-ds-rendered-families]')!;
  node.textContent = text;
  return node;
}

function loading() {
  const readyState = vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
  return {
    parsed: () => {
      readyState.mockReturnValue('interactive');
      document.dispatchEvent(new Event('DOMContentLoaded'));
    },
  };
}

beforeEach(() => {
  RENDERED_FAMILIES_CHANNEL.open = true;
});

afterEach(() => {
  RENDERED_FAMILIES_CHANNEL.open = false;
  vi.restoreAllMocks();
});

describe('partially streamed rendered-families list', () => {
  it('(a) an incomplete list that completes before DOMContentLoaded warms what it names then', async () => {
    const document_ = loading();
    const node = listNode('["PlA@modern","PlA');
    const a = family('PlA');
    expect(a).not.toHaveBeenCalled();

    node.textContent = '["PlA@modern"]';
    document_.parsed();
    await settle();

    expect(a).toHaveBeenCalledTimes(1);
  });

  it('(b) a registration after the text completes warms at once; earlier ones warm on DOMContentLoaded', async () => {
    const document_ = loading();
    const node = listNode('["PlBEarly@modern","PlBLa');
    const early = family('PlBEarly');
    node.textContent = '["PlBEarly@modern","PlBLate@modern"]';
    const late = family('PlBLate');
    expect(late).toHaveBeenCalledTimes(1);
    expect(early).not.toHaveBeenCalled();

    document_.parsed();
    await settle();

    expect(early).toHaveBeenCalledTimes(1);
    expect(late).toHaveBeenCalledTimes(1);
  });

  it('(c) a valid empty list warms nothing and logs nothing', async () => {
    const errors = vi.spyOn(console, 'error').mockImplementation(() => {});
    listNode('[]');
    const c = family('PlC');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await settle();

    expect(c).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
  });

  it('(d) text that never parses warms nothing, arms one listener and is read as empty once loading ends', async () => {
    const listeners = vi.spyOn(document, 'addEventListener');
    const document_ = loading();
    listNode('["PlD@modern"');
    const first = family('PlD');
    const second = family('PlDSecond');
    document_.parsed();
    const parses = vi.spyOn(JSON, 'parse');
    const third = family('PlDThird');
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await settle();

    expect([first, second, third].map((spy) => spy.mock.calls.length)).toEqual([0, 0, 0]);
    expect(listeners.mock.calls.filter(([type]) => type === 'DOMContentLoaded')).toHaveLength(1);
    expect(parses).not.toHaveBeenCalled();
  });

  it('(e) a node that appears after module evaluation still warms on DOMContentLoaded', async () => {
    const document_ = loading();
    const e = family('PlE');
    listNode('["PlE@modern"]');
    expect(e).not.toHaveBeenCalled();

    document_.parsed();
    await settle();

    expect(e).toHaveBeenCalledTimes(1);
  });

  it('(f) a registration after DOMContentLoaded with a complete list warms at once, once', async () => {
    listNode('["PlF@modern"]');
    const f = family('PlF');
    family('PlF', f);
    document.dispatchEvent(new Event('DOMContentLoaded'));
    await settle();

    expect(f).toHaveBeenCalledTimes(1);
  });
});
