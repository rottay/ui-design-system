import tenantThemeCanaryFixtures from '@rottay/design-system/tenant-theme-canary-fixtures';

import type { TortureThemeSpecimen } from '..';

/**
 * The published canary row, exactly as the design system sanctions it — the
 * JSONB payload a customer writes plus the trusted identity columns the read
 * path supplies, kept separate the way the database stores them.
 *
 * It lives beside the resolver rather than inside it because the resolver is
 * loaded directly by the first-paint assertion under Node, where a JSON module
 * needs an import attribute the bundler does not use. Both the server embed and
 * the client declaration read the specimen from here, so they cannot compile
 * two different documents.
 */
export function publishedManagementSpecimen(): TortureThemeSpecimen {
  const specimen = tenantThemeCanaryFixtures.specimens.themanagement;
  if (!specimen) {
    throw new Error('The published The Management canary specimen is missing');
  }
  return specimen;
}
