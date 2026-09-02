/* Positive control for the data-part classifier. Every shape below is labelled
   with the verdict the instrument MUST return. Nine shapes, four of which are
   traps that a naive attribute-only reader gets wrong. */
import { forwardRef, useLayoutEffect, useRef } from 'react';

// EXPECT: HARDCODED  (literal, no later spread)
export const A = (props: any) => <div data-part="root" {...noSpread} />;
const noSpread = {};

// EXPECT: REPLACE  (nullish coalescing — caller wins)
export const B = ({ 'data-part': dataPart, ...rest }: any) => (
  <div data-part={dataPart ?? 'root'} {...rest} />
);

// EXPECT: PASSTHROUGH  (bare identifier, no default)
export const C = ({ 'data-part': dataPart, ...rest }: any) => (
  <div data-part={dataPart} {...rest} />
);

// TRAP 1 — EXPECT: SPREAD_OVERRIDE
// literal written FIRST, rest spread AFTER, and 'data-part' was NOT destructured
// out of props, so props['data-part'] silently overwrites the literal.
export const D = ({ className, ...rest }: any) => (
  <div data-part="root" className={className} {...rest} />
);

// TRAP 2 — EXPECT: HARDCODED
// same ordering as D, but 'data-part' IS destructured out, so the rest cannot
// carry it and the literal genuinely wins.
export const E = ({ 'data-part': _part, ...rest }: any) => (
  <div data-part="root" {...rest} />
);

// TRAP 3 — EXPECT: HARDCODED
// spread appears BEFORE the literal, so the literal wins regardless.
export const F = ({ ...rest }: any) => <div {...rest} data-part="root" />;

// TRAP 4 — EXPECT: NONE_BUT_SPREAD
// no data-part attribute at all, but an undestructured rest reaches the DOM,
// so a caller's data-part lands here even though the file never mentions one.
export const G = ({ className, ...rest }: any) => <div className={className} {...rest} />;

// EXPECT: STAMPED  (imperative post-render override, classic's shape)
export const H = forwardRef<HTMLButtonElement, any>((props, ref) => {
  const rootRef = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    stampDataPart(rootRef.current, 'trigger');
  });
  return <button ref={rootRef} {...props} />;
});
declare function stampDataPart(el: unknown, part: string): void;

// EXPECT: HARDCODED, value read through a constant (non-literal initializer)
const PART = 'panel';
export const I = (props: any) => <div data-part={PART} />;

// --- second axis: data-part emitted OUTSIDE a JSX attribute -----------------
// These are the shapes that made the first version of this instrument return a
// false zero on Button's root element.
declare function partAttributes(part: string, state: unknown): { 'data-part': string };

// EXPECT: REPLACE  (helper call, nullish arg — Button/modern's real shape)
export const J = ({ 'data-part': dataPart, ...rest }: any) => (
  <button {...rest} {...partAttributes(dataPart ?? 'trigger', {})} />
);

// EXPECT: HARDCODED  (helper call, literal arg, spread AFTER rest — Button/rustic's shape)
export const K = ({ ...rest }: any) => (
  <button {...rest} {...partAttributes('trigger', {})} />
);

// EXPECT: SPREAD_OVERRIDE  (helper call with a literal, then an open rest lands after)
export const L = ({ className, ...rest }: any) => (
  <button {...partAttributes('trigger', {})} {...rest} />
);

// EXPECT: HARDCODED  (hand-built attribute object spread onto the element)
const skinAttributes = { 'data-part': 'panel', 'data-variant': 'x' } as const;
export const M = ({ 'data-part': _p, ...rest }: any) => <div {...rest} {...skinAttributes} />;

// --- third axis: the emission is nested one level deeper --------------------
// EXPECT: REPLACE — partAttributes spread INSIDE the attribute object, which is
// then spread onto the element. Button/modern's real shape; the version of this
// instrument that scanned only object PROPERTIES reported Button/modern as
// having no root part at all.
export const N = ({ 'data-part': dataPart, ...rest }: any) => {
  const nativeProps = {
    'data-loading': 'false',
    ...partAttributes(dataPart ?? 'trigger', {}),
  };
  return <button {...rest} {...nativeProps} />;
};

// EXPECT: SPREAD_OVERRIDE — the rest is destructured in the BODY, not the
// parameter list. Button/rustic's real shape; a parameter-only walk called this
// spread opaque.
export const O = (props: any) => {
  const { className, ...rest } = props;
  return <div data-part="root" className={className} {...rest} />;
};
