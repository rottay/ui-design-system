import { Badge } from '@rottay/design-system';

/**
 * Parity verdict B for `Badge` `variant` (W10-RET01-PARITY rows 2, 3 and 22): `tone` reproduces `default`,
 * `primary`, `success`, `warning`, `error` and `info`; `secondary` has no tone on any engine and `gradient`
 * is not mapped, so they and any value the kit cannot read stay. Proof: Badge.variant-tone-parity.test.tsx.
 */
export function Statuses({ status }: { status: 'error' | 'secondary' }) {
  return (
    <>
      <Badge variant="error">Failed</Badge>
      <Badge variant={'default'}>Draft</Badge>
      <Badge variant="secondary">Archived</Badge>
      <Badge variant={status}>Live</Badge>
    </>
  );
}
