import assert from 'node:assert/strict';
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { auditGraphicsPackaging } from './cra-17-packaging-license-gate.mjs';

const coreRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const canonicalManifestRoot = resolve(coreRoot, 'provenance/graphics');
const canonicalCloudAdapter = resolve(
  coreRoot,
  'src/graphics/brand-marks/runtime/adapters/thesvg-react/cloud-service/index.tsx',
);

function withManifestFixture(run) {
  const fixtureRoot = mkdtempSync(resolve(tmpdir(), 'rottay-cra17-graphics-'));
  const manifestRoot = resolve(fixtureRoot, 'graphics');
  cpSync(canonicalManifestRoot, manifestRoot, { recursive: true });
  const manifestPath = resolve(manifestRoot, 'pack-allowlist.json');
  try {
    return run({ fixtureRoot, manifestPath, manifestRoot });
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function mutateManifest(manifestPath, mutate) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  mutate(manifest);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

test('canonical graphics pack has exhaustive licensed provenance and notice coverage', () => {
  assert.deepEqual(auditGraphicsPackaging(), {
    schemaVersion: 1,
    providers: 3,
    functionalIcons: 263,
    functionalIconCompatibilityImports: 330,
    brandMarks: 9,
    cloudServiceMarks: 4,
    featurePictograms: 8,
    notice: 'THIRD_PARTY_NOTICES.md',
    archivedLicenses: 2,
  });
});

test('functional semantic corpus and named compatibility catalog have separate pinned inventories', () => {
  withManifestFixture(({ manifestPath }) => {
    mutateManifest(manifestPath, (manifest) => {
      const catalog = manifest.assetClasses.functionalIcon.compatibilityCatalog;
      catalog.expectedImportEntries -= 1;
    });
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /functional icon compatibility catalog expected 329 imports, found 330/,
    );
  });

  withManifestFixture(({ manifestPath }) => {
    mutateManifest(manifestPath, (manifest) => {
      const catalog = manifest.assetClasses.functionalIcon.compatibilityCatalog;
      catalog.importInventorySha256 = 'f'.repeat(64);
    });
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /functional icon compatibility catalog import inventory hash drifted/,
    );
  });

  withManifestFixture(({ manifestPath }) => {
    mutateManifest(manifestPath, (manifest) => {
      const functionalIcon = manifest.assetClasses.functionalIcon;
      functionalIcon.semanticSourceRoot = functionalIcon.compatibilityCatalog.rootPath;
    });
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /functional icon semantic and compatibility source roots must not overlap/,
    );
  });

  withManifestFixture(({ manifestPath }) => {
    mutateManifest(manifestPath, (manifest) => {
      manifest.assetClasses.functionalIcon.compatibilityCatalog.providers = ['@thesvg/react'];
    });
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /functional icon compatibility catalog imports an undeclared provider/,
    );
  });
});

test('packaged supplier imports fail closed without an allowlisted license record', () => {
  withManifestFixture(({ manifestPath }) => {
    mutateManifest(manifestPath, (manifest) => {
      manifest.providers = manifest.providers.filter(
        ({ packageName }) => packageName !== '@phosphor-icons/react',
      );
    });
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /packaged graphics provider allowlist drifted/,
    );
  });
});

test('BrandMark, CloudServiceMark and FeaturePictogram registries are exhaustive', () => {
  withManifestFixture(({ manifestPath }) => {
    mutateManifest(manifestPath, (manifest) => {
      manifest.assetClasses.cloudServiceMark =
        manifest.assetClasses.cloudServiceMark.filter(({ service }) => service !== 's3');
    });
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /CloudServiceMark service inventory drifted/,
    );
  });
});

test('AWS records cannot opt into derivatives or drift from trademark guidance', () => {
  withManifestFixture(({ manifestPath }) => {
    mutateManifest(manifestPath, (manifest) => {
      const [lambda] = manifest.assetClasses.cloudServiceMark;
      lambda.modified = true;
      lambda.derivativesAllowed = true;
      lambda.trademarkGuidance = 'https://example.invalid/';
    });
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /aws-aws-lambda violates the governed AWS no-derivatives\/trademark policy/,
    );
  });
});

test('archived license bytes and the packaged notice are immutable evidence', () => {
  withManifestFixture(({ manifestPath, manifestRoot, fixtureRoot }) => {
    const licensePath = resolve(
      manifestRoot,
      'licenses/phosphor-icons-react-LICENSE',
    );
    writeFileSync(licensePath, `${readFileSync(licensePath, 'utf8')}tampered\n`);
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath }),
      /provider phosphor-icons-react license hash drifted/,
    );

    cpSync(resolve(coreRoot, 'THIRD_PARTY_NOTICES.md'), resolve(fixtureRoot, 'NOTICE.md'));
    writeFileSync(resolve(fixtureRoot, 'NOTICE.md'), 'incomplete notice\n');
    assert.throws(
      () => auditGraphicsPackaging({
        manifestPath,
        noticePath: resolve(fixtureRoot, 'NOTICE.md'),
      }),
      /THIRD_PARTY_NOTICES hash drifted/,
    );
  });
});

test('AWS adapter rejects local SVG artwork or transform injection', () => {
  withManifestFixture(({ fixtureRoot, manifestPath }) => {
    const adapterPath = resolve(fixtureRoot, 'cloud-adapter.tsx');
    const source = readFileSync(canonicalCloudAdapter, 'utf8').replace(
      'default:\n      return null;',
      'default:\n      return <path />;',
    );
    assert.notEqual(source, readFileSync(canonicalCloudAdapter, 'utf8'));
    writeFileSync(adapterPath, source);
    assert.throws(
      () => auditGraphicsPackaging({ manifestPath, cloudAdapterPath: adapterPath }),
      /AWS adapter contains local artwork element <path>/,
    );
  });
});
