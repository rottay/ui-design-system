import { Space } from '@rottay/design-system';

type Extra = { id?: string; title?: string };

declare const rest: Extra;
declare const key: string;
declare const on: boolean;
declare const size: 'small';
declare function extras(): Extra;

/** An inline object literal whose every key is a static name other than `size` cannot carry `size`: silent. */
export function Proven() {
  const id = 'a';
  return (
    <>
      <Space {...{ id: 'a' }} />
      <Space {...({ id, 'data-kind': 'gap', 0: 'zero', onClick() {} })} />
      <Space {...({ type: 'button' } as any)} />
      <Space {...({ id: 'a' } satisfies Extra)} />
      <Space {...((({ id: 'a' }) as Extra) satisfies Extra)} />
      <Space {...{}} />
      <Space size="small" {...({ title: 'small' } as Extra)} />
    </>
  );
}

/** A literal that states `size` is reported like any spread; an object is not an attribute list. */
export function Stated() {
  return (
    <>
      <Space {...{ size: 'small' }} />
      <Space {...({ 'size': 'large' } as any)} />
      <Space {...{ size }} />
      <Space {...{ get size() { return 'small' as const; } }} />
      <Space {...({ size() {} } as any)} />
    </>
  );
}

/** Anything the kit cannot read in place still proves nothing. */
export function Unproven() {
  return (
    <>
      <Space {...rest} />
      <Space {...{ [key]: 'small' }} />
      <Space {...{ ...rest, id: 'a' }} />
      <Space {...extras()} />
      <Space {...(on ? { id: 'a' } : {})} />
    </>
  );
}
