'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * Defers its subtree to the client, after hydration.
 *
 * WHY THE DB GROUND NEEDS THIS. `LabGround` mints the SSR artifact receipt in
 * the RSC module instance (`emitTenantThemeArtifactForSsr`), but the provider
 * server-renders in a SECOND module instance whose `MINTED_SSR_RECEIPTS`
 * registry never saw that mint, so its receipt audit fails closed
 * (`admission/index.ts:606-607`) and the server paints the (empty)
 * `LoadingScreen`. And even with one shared instance the receipt could not
 * survive: it crosses the flight boundary as a serialized copy, and the
 * registry is a WeakSet keyed on object identity (`admission/index.ts:535`),
 * which serialization destroys by construction. In the browser the provider
 * takes the mounted-DOM path instead, verifies the embedded artifact and
 * renders the scene on the FIRST client render. Server empty vs client scene
 * is a hydration mismatch; React then regenerates the tree, the RSC-replayed
 * `<style>` coexists transiently with the SSR one, and the retention watch
 * revokes the artifact ("expected exactly one mounted artifact element,
 * found 2").
 *
 * Rendering nothing on the server and on the first client render makes the two
 * agree; the provider then mounts against an already-stamped, already-embedded
 * document. The stamp script and the artifact `<style>` stay server-rendered
 * outside this gate — nothing about the prepaint contract changes, and the
 * admission that actually runs is the STRONG half of the invariant (unique
 * element + digest attribute + byte-exact textContent).
 *
 * PROGRAMME DEBT (independent architectural review, 2026-08-30
 * five-phase causal-canary review):
 * the `ssrReceipt` contract is unreachable in the canonical RSC→client
 * topology — the only viable envelope is minting inside the client layer in
 * one module instance. Noted in the historical canary record; the pinned product
 * (app-bithire) does not carry this contract yet, so the exposure is latent,
 * not live. Ratified by the independent close review.
 */
export function ClientOnly({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted ? <>{children}</> : null;
}
