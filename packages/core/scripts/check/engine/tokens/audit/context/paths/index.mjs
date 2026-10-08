import { existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packageRoot as findPackageRoot, repoRoot as findRepoRoot } from '../../../../../../libraries/repo-root/index.mjs';

/** The audit's own directory, the authority every path below is resolved from. */
const auditDir = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const root = findPackageRoot(auditDir);
const componentsDir = join(root, 'src/components');
const baselinePath = join(auditDir, 'baseline/index.json');
const tokensCssDir = join(root, 'src/foundation/tokens/css');
const artifactsDir = join(tokensCssDir, 'facade/artifacts');
const foundationDir = join(tokensCssDir, 'foundation');

const themeCssPath = join(tokensCssDir, 'runtime/engines/modern/theme/index.css');
const frameworkBridgeCssPath = join(tokensCssDir, 'runtime/engines/modern/framework-bridge/index.css');
/** WO-GAT-02: the classic/rustic counterparts of `themeCssPath`, scanned by the same shared
 * `auditEngineTheme()` helper (see below) -- never a second scan implementation. */
const classicThemeCssPath = join(tokensCssDir, 'runtime/engines/classic/theme/index.css');
const rusticThemeCssPath = join(tokensCssDir, 'runtime/engines/rustic/theme/index.css');

const repoRoot = findRepoRoot(auditDir);
const tokenAuditDir = join(
  repoRoot,
  'packages/core/artifacts/quality/audits/engine/tokens',
);

function requireUiSource(relativePath, owner) {
  const full = join(componentsDir, relativePath);
  if (!existsSync(full) || !statSync(full).isFile()) {
    throw new Error(`${owner} requires canonical UI source: ${relativePath}`);
  }
  return full;
}

export {
  auditDir,
  root,
  componentsDir,
  baselinePath,
  tokensCssDir,
  artifactsDir,
  foundationDir,
  themeCssPath,
  frameworkBridgeCssPath,
  classicThemeCssPath,
  rusticThemeCssPath,
  repoRoot,
  tokenAuditDir,
  requireUiSource,
};
