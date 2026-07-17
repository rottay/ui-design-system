/**
 * Stable identity vocabulary for product profiles.
 *
 * The identity is lower-level than both a ProductProfile definition and a
 * VerticalPreset, so those two composition contracts can share one source
 * without depending on one another.
 */
export type ProductProfileKey =
  | 'generic.default'
  | 'events.organizer'
  | 'recruiting.operator'
  | 'platform.admin'
  | 'platform.flagship'
  | (string & {});
