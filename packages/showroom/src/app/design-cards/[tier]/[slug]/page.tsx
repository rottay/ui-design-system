import { CardClient } from './card-client';

/**
 * Internal route consumed only by scripts/design-cards/generate.mjs.
 * Renders one design-system component preview without showroom chrome so the
 * generator can harvest a clean, self-contained card for Claude Design.
 */
export const dynamic = 'force-dynamic';

export default async function DesignCardPage({
  params,
}: {
  params: Promise<{ tier: string; slug: string }>;
}) {
  const { tier, slug } = await params;
  return <CardClient tier={tier} slug={slug} />;
}
