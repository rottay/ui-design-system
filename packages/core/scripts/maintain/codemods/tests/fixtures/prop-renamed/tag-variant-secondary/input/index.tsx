import { Tag } from '@rottay/design-system';

/**
 * Parity verdict B for `Tag` `variant` (W10-RET01-PARITY rows 8 and 9): `tone` reproduces `default`,
 * `primary`, `success`, `warning` and `error`; `secondary` has no tone on any engine and `gradient` is not
 * mapped, so they and any value the kit cannot read stay. Proof: Tag.variant-tone-parity.test.tsx.
 */
export function Labels({ row }: { row: { tone: 'success' | 'secondary' } }) {
  return (
    <>
      <Tag variant="success">Paid</Tag>
      <Tag variant={'error'}>Refused</Tag>
      <Tag variant="secondary">Archived</Tag>
      <Tag variant={row.tone}>Live</Tag>
    </>
  );
}
