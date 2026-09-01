/**
 * @fileoverview Comparing two artifacts — the capability the rest of this
 * instrument exists to serve.
 *
 * An absolute reading ("this card paints 14px") settles very little on its own;
 * nobody knows whether 14px is right. A DIFFERENCE settles a great deal: "this
 * change moved exactly these properties, on these tenants, in these themes, and
 * nothing else" is a claim a reviewer can check and a lane can be held to.
 *
 * THE COMPARABILITY GUARD. Two artifacts are only comparable if they measured
 * the same question. A diff across different bundle modes, different fixtures
 * or a different browser is not a design-system delta, it is an instrument
 * delta wearing one. So the differences in PROVENANCE are computed first and
 * reported first, and `comparable` is false whenever they exist. The diff is
 * still produced — suppressing it would hide information — but it arrives
 * labelled.
 *
 * @module Tooling/ResolutionProbe/Composition/Diff
 */

/**
 * @param {object} before an artifact from `runProbe`
 * @param {object} after  another artifact from `runProbe`
 */
export function diffArtifacts(before, after) {
  const { provenanceDifferences, inputDifferences } = diffProvenance(before, after);
  const changes = [];
  const scopes = union(Object.keys(before.readings ?? {}), Object.keys(after.readings ?? {}));

  for (const scope of scopes) {
    const left = before.readings?.[scope];
    const right = after.readings?.[scope];
    if (!left || !right) {
      changes.push({
        kind: 'scope-only-in-one-run',
        scope,
        presentIn: left ? 'before' : 'after',
      });
      continue;
    }
    for (const targetKey of union(Object.keys(left), Object.keys(right))) {
      const leftTarget = left[targetKey];
      const rightTarget = right[targetKey];
      if (!leftTarget || !rightTarget) {
        changes.push({
          kind: 'target-only-in-one-run',
          scope,
          target: targetKey,
          presentIn: leftTarget ? 'before' : 'after',
        });
        continue;
      }
      if (leftTarget.present !== rightTarget.present) {
        changes.push({
          kind: 'element-presence-changed',
          scope,
          target: targetKey,
          before: leftTarget.present,
          after: rightTarget.present,
        });
        continue;
      }
      for (const property of union(
        Object.keys(leftTarget.values ?? {}),
        Object.keys(rightTarget.values ?? {}),
      )) {
        const leftValue = leftTarget.values?.[property];
        const rightValue = rightTarget.values?.[property];
        if (leftValue !== rightValue) {
          changes.push({
            kind: 'value-changed',
            scope,
            target: targetKey,
            property,
            before: leftValue ?? null,
            after: rightValue ?? null,
          });
        }
      }
    }
  }

  const byScope = {};
  for (const change of changes) {
    if (!change.scope) continue;
    byScope[change.scope] = (byScope[change.scope] ?? 0) + 1;
  }

  return {
    comparable: provenanceDifferences.length === 0,
    provenanceDifferences,
    inputDifferences,
    totals: {
      scope: 'rows compared across every (vertical × theme × fixture × property) in both runs',
      changedRows: changes.length,
      changedRowsByScope: byScope,
    },
    changes,
  };
}

function diffProvenance(before, after) {
  const differences = [];
  const push = (field, a, b) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      differences.push({ field, before: a ?? null, after: b ?? null });
    }
  };
  push('artifactVersion', before.artifactVersion, after.artifactVersion);
  push('provenance.bundleMode', before.provenance?.bundleMode, after.provenance?.bundleMode);
  push(
    'provenance.browser.browserVersion',
    before.provenance?.browser?.browserVersion,
    after.provenance?.browser?.browserVersion,
  );
  push('scopeOfRun.fixtures', before.scopeOfRun?.fixtures, after.scopeOfRun?.fixtures);
  push('scopeOfRun.verticals', before.scopeOfRun?.verticals, after.scopeOfRun?.verticals);
  push('scopeOfRun.themes', before.scopeOfRun?.themes, after.scopeOfRun?.themes);
  push('scopeOfRun.engine', before.scopeOfRun?.engine, after.scopeOfRun?.engine);
  push('scopeOfRun.viewport', before.scopeOfRun?.viewport, after.scopeOfRun?.viewport);

  // A bundle sha change is the EXPECTED cause of a diff — the CSS is what the
  // lane changed. It is an input delta, not an incomparability, so it is kept
  // out of `provenanceDifferences` and does not flip `comparable`.
  const inputDifferences = [];
  const bundleShas = {};
  for (const vertical of union(
    Object.keys(before.provenance?.bundles ?? {}),
    Object.keys(after.provenance?.bundles ?? {}),
  )) {
    const a = before.provenance?.bundles?.[vertical]?.sha256;
    const b = after.provenance?.bundles?.[vertical]?.sha256;
    if (a !== b) bundleShas[vertical] = { before: a ?? null, after: b ?? null };
  }
  if (Object.keys(bundleShas).length > 0) {
    inputDifferences.push({
      field: 'provenance.bundles[*].sha256',
      note: 'The measured CSS itself differs. This is the intended cause of a diff, not a defect.',
      bundleShas,
    });
  }
  return { provenanceDifferences: differences, inputDifferences };
}

function union(a, b) {
  return [...new Set([...a, ...b])].sort();
}
