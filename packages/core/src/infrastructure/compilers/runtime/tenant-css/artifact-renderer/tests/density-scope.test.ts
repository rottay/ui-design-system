/** The density-boundary rule in both emission paths: the same declarations, differing only by the scope
 *  they hang off, or a DB tenant and its vertical would re-declare different channels at one boundary. */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  containerScope,
  emitDensityScopeRule,
  emitTenantArtifactCss,
  tenantArtifactScope,
} from '@/infrastructure/compilers/runtime/theme/runtime/emission';
import { projectFirstPartyArtifactScopes } from '@/infrastructure/compilers/kernel/foundation/css/scope-projection';

import { FIRST_PARTY_ARTIFACT_SPECS, renderFirstPartyArtifact } from '../index';

const SRC = resolve(__dirname, '../../../../../..');

const sorted = (variables: Readonly<Record<string, string>>) =>
  Object.fromEntries(Object.keys(variables).sort().map((key) => [key, variables[key] as string]));

const body = (rule: string) => rule.slice(rule.indexOf('{'));

describe('the density boundary rule in both emission paths', () => {
  it.each(FIRST_PARTY_ARTIFACT_SPECS.map((spec) => [spec.slug, spec] as const))(
    '%s: the committed artifact carries exactly the compiled boundary rule',
    (slug, spec) => {
      const { compiled, css } = renderFirstPartyArtifact({ spec });
      const block = compiled.densityScopeBlock;
      expect(block && Object.keys(block.cssVariables).length).toBeGreaterThan(0);
      const expected = projectFirstPartyArtifactScopes(
        emitDensityScopeRule({ cssVariables: sorted(block!.cssVariables) }, containerScope(spec.selector)),
        slug,
        spec.verticalKey,
      );
      expect(css).toContain(expected);
      expect(css.split(":where([data-density='compact']:not(:root)").length - 1).toBe(1);
      const committed = readFileSync(
        resolve(SRC, `foundation/tokens/css/facade/artifacts/${slug}/index.css`),
        'utf8',
      );
      expect(committed).toBe(css);
    },
  );

  it('the DB artifact states the same declarations under its own scope', () => {
    const spec = FIRST_PARTY_ARTIFACT_SPECS.find((candidate) => candidate.slug === 'bithire')!;
    const { compiled } = renderFirstPartyArtifact({ spec });
    const variables = sorted(compiled.densityScopeBlock!.cssVariables);
    const db = emitTenantArtifactCss({
      verticalKey: 'bithire',
      slug: 'acme',
      compilerVersion: 'probe',
      digest: 'probe',
      variables: {},
      densityScopeVariables: variables,
    });
    const dbRule = emitDensityScopeRule({ cssVariables: variables }, tenantArtifactScope('bithire', 'acme'));
    expect(db).toContain(dbRule);
    const firstParty = emitDensityScopeRule({ cssVariables: variables }, containerScope(spec.selector));
    expect(body(dbRule)).toBe(body(firstParty));
  });

  it('an artifact with nothing to re-declare carries no boundary rule', () => {
    const db = emitTenantArtifactCss({
      verticalKey: 'bithire',
      slug: 'acme',
      compilerVersion: 'probe',
      digest: 'probe',
      variables: { '--ds-color-primary': '#123456' },
      densityScopeVariables: {},
    });
    expect(db).not.toContain('data-density');
  });
});
