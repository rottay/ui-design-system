/**
 * Stable identity vocabulary for product profiles.
 *
 * The identity is lower-level than both a ProductProfile definition and a
 * VerticalPreset, so those two composition contracts can share one source
 * without depending on one another.
 */
/**
 * The closed set of product-profile identities.
 *
 * CLOSED, deliberately. The union previously carried an `| (string & {})`
 * open tail, which made every key a valid key: a typo, a stale `platform.*`
 * spelling, or a profile that no registry entry backs all type-checked
 * identically to a real one. The presets registry resolves fail-closed at
 * runtime, so an unknown key was never PAINTED — it silently fell back to the
 * default instead, which is precisely the failure that stays invisible.
 *
 * The `rottay.*` namespace replaces the former `platform.*` one. Those two
 * keys named the Rottay vertical's own profiles; `platform` was a second
 * spelling of `rottay`, and keeping it here would reintroduce below the
 * roster the exact drift the roster exists to remove.
 */
export type ProductProfileKey =
  | 'generic.default'
  | 'events.organizer'
  | 'recruiting.operator'
  | 'rottay.admin'
  | 'rottay.flagship';
