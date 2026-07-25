# Wave 0 quality evidence

This directory is an executable skeleton for the two-pass component quality
program. It is tooling-only and does not ship in `@rottay/design-system`.

## Ownership

- `registry.mjs` expands 89 public primitive contracts.
- `pairwise.mjs` builds a bounded, deterministic evidence matrix.
- `schema.mjs` validates registry and scorecard policy.
- `quality-evidence.schema.json` documents the scorecard interchange shape.
- `scorer.mjs` calculates Pass 1, Pass 2 and final disposition.
- `scorecard.example.json` is deliberately pending and makes no quality claim.

States and short/long/pathological content are rendered together inside every
evidence cell. The generated matrix pairwise-covers only the declared, disjoint
axis groups:

1. density × brand × canvas × locale;
2. responsive context × direction;
3. motion preference × input modality.

This is intentionally not the full Cartesian product. Every cell still exposes
all states and content profiles to DOM assertions and sighted review.

## CLI

The commands are intentionally not package scripts yet. Wave 0 can be reviewed
without changing the repository's build or CI contract.

```sh
node packages/core/scripts/quality-evidence/cli.mjs validate-manifest
node packages/core/scripts/quality-evidence/cli.mjs manifest DS-P032
node packages/core/scripts/quality-evidence/cli.mjs matrix DS-P032
node packages/core/scripts/quality-evidence/cli.mjs empty-scorecard DS-P032
node packages/core/scripts/quality-evidence/cli.mjs validate-scorecard ./scorecard.json
node packages/core/scripts/quality-evidence/cli.mjs score ./scorecard.json
```

`score` exits unsuccessfully until the component is completion-eligible. A
perfect Pass 1 and a numeric score of 100 still cannot approve Pass 2 unless a
reviewer, timestamp and every required craft artifact are present.

## Non-claims

- The registry does not prove the referenced stories or artifacts exist yet.
- It does not generate or approve screenshots.
- It does not replace existing regression baselines.
- It does not certify current components.
- `bithire-static` and `themanagementmiami-db` are the required real fixture
  identities. Locale is orthogonal to brand: every component must prove the
  BitHire static artifact and The Management DB fixture in English and Spanish,
  plus an Arabic RTL stress cell. Wiring screenshots and computed-style capture
  into the evidence runner remains integration work.
- Applications may compose DS components and choose recipes, but application CSS
  must not repair private DS anatomy or shared component chrome.
