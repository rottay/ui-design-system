/**
 * The planted emitter every chrome-emitter drill starts from: a whole emitter
 * folder in a tmpdir core root. The real tree is only read.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { packageRoot } from '../../../../repo-root/index.mjs';
import { CHROME_EMITTER_DIR } from '../../index.mjs';

export const CORE_ROOT = packageRoot(dirname(fileURLToPath(import.meta.url)));

export const ROOT_SOURCE = `import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";
import { applyRadiusDial } from "@/foundation/kernel/geometry/radius-dial";

import { DRILL_CHROME_VARIABLES } from "./tables";

import { setDrillVars } from "./writers";

export function chromeToVariables(chrome: BrandChrome): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [field, name] of Object.entries(DRILL_CHROME_VARIABLES)) vars[name] = String(applyRadiusDial(field));
  setDrillVars(vars, chrome);
  return vars;
}
`;

export const TABLES_SOURCE = `import type { BrandDrillChrome } from "@/foundation/contracts/composition/tenants/themes";

const chromeVariableMap = <T extends object>(
  prefix: string,
  fields: readonly (keyof T)[]
): Readonly<Record<keyof T, string>> =>
  Object.fromEntries(
    fields.map((field) => [
      field,
      \`\${prefix}\${String(field).replace(
        /[A-Z]/g,
        (letter) => \`-\${letter.toLowerCase()}\`
      )}\`,
    ])
  ) as Readonly<Record<keyof T, string>>;

const DRILL_FAMILY_VARIABLES = chromeVariableMap<BrandDrillChrome>("--ds-drill-", ["bg", "border"] as const);

export const DRILL_CHROME_VARIABLES = {
  bg: "--ds-drill-bg",
  nested: [["drill", DRILL_FAMILY_VARIABLES]],
} as const satisfies Readonly<Record<string, unknown>>;
`;

export const WRITERS_SOURCE = `import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";

function setDrillVars(vars: Record<string, string>, chrome: BrandChrome): void {
  if (chrome) vars["--ds-drill-writer"] = "1";
}

export { setDrillVars };
`;

export function plant(overrides = {}) {
  const core = mkdtempSync(join(tmpdir(), 'chrome-emitter-drill-'));
  const files = {
    [`${CHROME_EMITTER_DIR}/index.ts`]: ROOT_SOURCE,
    [`${CHROME_EMITTER_DIR}/tables/index.ts`]: TABLES_SOURCE,
    [`${CHROME_EMITTER_DIR}/writers/index.ts`]: WRITERS_SOURCE,
    [`${CHROME_EMITTER_DIR}/tests/frozen.test.ts`]: 'import { chromeToVariables } from "..";\n',
    'src/foundation/kernel/geometry/radius-dial/index.ts': 'export const applyRadiusDial = (value: string) => value;\n',
    ...overrides,
  };
  for (const [rel, text] of Object.entries(files)) {
    if (text === null) continue;
    mkdirSync(dirname(join(core, rel)), { recursive: true });
    writeFileSync(join(core, rel), text);
  }
  test.after(() => rmSync(core, { recursive: true, force: true }));
  return core;
}

export const emitterDir = (core) => join(core, CHROME_EMITTER_DIR);

export const W = `${CHROME_EMITTER_DIR}/writers/index.ts`;
export const WRITER_HEAD = `import type { BrandChrome } from "@/foundation/contracts/composition/tenants/themes";
`;
export const writerOf = (body, exportList = 'setDrillVars') => `${WRITER_HEAD}\n${body}\nexport { ${exportList} };\n`;
export const DRILL_WRITER = 'function setDrillVars(vars: Record<string, string>, chrome: BrandChrome): void {\n  if (chrome) vars["--ds-drill-writer"] = "1";\n}\n';
