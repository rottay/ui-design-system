import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = findPackageRoot(SCRIPT_DIR);
const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.mts', '.cts'];
const OWNERS = new Set(['contracts', 'runtime', 'primitives', 'patterns', 'structures', 'surfaces']);
const UI_OWNERS = new Set(['primitives', 'patterns', 'structures', 'surfaces']);

/**
 * EL TECHO DE BYTES ES DECRECE-SOLO, Y DESDE AQUI ES MECANICO.
 *
 * `budget.maxSourceBytes` acota cuanto codigo alcanza cada subpath publico. El
 * gate ya prohibia SUPERAR el techo; lo que nadie impedia era SUBIR EL TECHO:
 * editar el manifest y seguir verde. La ley decrece-solo existia -- el asiento
 * E-2 (2026-08-27) autorizo una ampliacion unica de +32.000 B sobre 18 subpaths
 * con la condicion literal "decrease-only inmediatamente; no habilita
 * posteriores re-anclas hacia arriba" -- pero vivia en prosa, en el bloque
 * `_budgetGovernance` del propio manifest. Una ley sin verificador es una nota.
 *
 * SE MIDE CONTRA UN ANCLA, no contra el commit anterior: el gate no tiene
 * historia, y comparar con git haria depender la ley del checkout. El ancla es
 * un archivo revisable al lado del gate, con el mismo patron que los demas
 * baselines del repo.
 *
 * FALLA EN LAS DOS DIRECCIONES. Subir es regresion salvo por la puerta
 * nombrada; bajar tambien falla, con la instruccion de bajar el ancla en el
 * mismo commit. Y los dos desacuerdos de conjunto -- un subpath con techo que
 * nadie anclo, y un ancla cuyo subpath ya no existe -- fallan tambien: un techo
 * nuevo que entra sin revision es exactamente como se pierde la ley.
 */
/* El nombre NO es cosmetico: la ley R3 del scripts-tree-gate admite en una
 * capacidad solo `index.mjs`, sus tests, y archivos que empiecen con el nombre
 * de la capacidad. `source-bytes-ceilings.baseline.json` era R3-foreign-file y
 * el barrido lo cazo -- por eso los demas baselines del repo se llaman
 * `slot-inventory.baseline.json`, `root-exposure-gate.baseline.json`: la
 * convencion ES la regla. */
export const CEILINGS_BASELINE_RELATIVE = 'scripts/boundaries/public-entrypoint-boundary-gate/public-entrypoint-boundary-gate.ceilings.baseline.json';

export function readCeilings(manifest) {
  const out = {};
  for (const [subpath, entry] of Object.entries(manifest?.entries ?? {})) {
    /* Se copia TODO lo que el manifest declara como techo, valido o no: filtrar
     * aqui lo invalido lo volveria invisible: el subpath desapareceria del lado
     * vivo y el ancla lo veria como huerfano, con un mensaje que no dice la
     * verdad. La forma la juzga `evaluateCeilings`, que es quien la nombra. */
    if (entry?.budget && 'maxSourceBytes' in entry.budget) out[subpath] = entry.budget.maxSourceBytes;
  }
  return out;
}

/**
 * UN TECHO TIENE QUE SER UN NUMERO PARA QUE COMPARARLO SIGNIFIQUE ALGO.
 *
 * Defecto real encontrado por Codex en el preaudit de este lote, y medido: la
 * primera version comparaba con `>` y `<` sin validar la forma, y en JavaScript
 * esas dos comparaciones son AMBAS falsas contra un string, un array, un objeto
 * o NaN. Un ancla con `"not-a-number"`, `[1000]`, `{}` o `NaN` pasaba con cero
 * errores: el verificador se volvia silencioso justo cuando su insumo estaba
 * roto, que es la forma mas cara de fallar. Un techo es un conteo de bytes:
 * entero, finito y positivo. Cualquier otra cosa es corrupcion y se nombra.
 */
export function isValidCeiling(value) {
  return typeof value === 'number' && Number.isInteger(value) && value > 0;
}

export function evaluateCeilings(live, baseline) {
  if (!baseline || typeof baseline.ceilings !== 'object' || baseline.ceilings === null
    || Array.isArray(baseline.ceilings)) {
    return ['el ancla de techos no existe o no tiene `ceilings`'];
  }
  const failures = [];
  for (const [subpath, value] of Object.entries(live)) {
    const anchored = baseline.ceilings[subpath];
    if (!isValidCeiling(value)) {
      failures.push(`${subpath}: el techo vivo ${JSON.stringify(value)} no es un entero positivo — un techo corrupto no se puede comparar`);
      continue;
    }
    if (anchored !== undefined && !isValidCeiling(anchored)) {
      failures.push(`${subpath}: el techo anclado ${JSON.stringify(anchored)} no es un entero positivo — el ancla esta corrupta y no gobierna nada`);
      continue;
    }
    if (anchored === undefined) {
      failures.push(`${subpath}: techo ${value} sin anclar en ${CEILINGS_BASELINE_RELATIVE} — un techo nuevo entra por revision, no por omision`);
      continue;
    }
    if (value > anchored) {
      failures.push(`${subpath}: techo ${anchored} -> ${value} SUBIO — se adelgaza el grafo, no el ancla. Si la subida esta autorizada, pedila por nombre: --write-baseline --widen --reason "..."`);
    } else if (value < anchored) {
      failures.push(`${subpath}: techo ${anchored} -> ${value} bajo — baja el ancla en el MISMO commit, con razon escrita: --write-baseline --reason "..."`);
    }
  }
  for (const [subpath, anchored] of Object.entries(baseline.ceilings)) {
    if (subpath in live) continue;
    failures.push(!isValidCeiling(anchored)
      ? `${subpath}: el ancla lo declara con ${JSON.stringify(anchored)}, que ni siquiera es un techo, y el manifest ya no le pone uno`
      : `${subpath}: el ancla lo declara y el manifest ya no le pone techo`);
  }
  return failures;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function relative(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join('/');
}

function manifestSource(root, filePath) {
  return relative(root, filePath).replace(/\.tsx$/, '.ts');
}

function resolveSourceModule(root, importer, specifier) {
  let base;
  if (specifier.startsWith('.')) base = path.resolve(path.dirname(importer), specifier);
  else if (specifier.startsWith('@/')) base = path.resolve(root, 'src', specifier.slice(2));
  else if (specifier.startsWith('@ui/')) base = path.resolve(root, 'src/ui', specifier.slice(4));
  else if (specifier.startsWith('@types/')) base = path.resolve(root, 'src/foundation/contracts', specifier.slice(7));
  else return null;

  const candidates = [
    ...SOURCE_EXTENSIONS.map((extension) => `${base}${extension}`),
    ...SOURCE_EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ];
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

function isTypeOnlyImport(node) {
  if (!node.importClause) return false;
  if (node.importClause.isTypeOnly) return true;
  const bindings = node.importClause.namedBindings;
  return Boolean(bindings && ts.isNamedImports(bindings) && bindings.elements.length > 0
    && bindings.elements.every((element) => element.isTypeOnly));
}

function isTypeOnlyExport(node) {
  if (node.isTypeOnly) return true;
  return Boolean(node.exportClause && ts.isNamedExports(node.exportClause)
    && node.exportClause.elements.length > 0
    && node.exportClause.elements.every((element) => element.isTypeOnly));
}

function parseModule(filePath) {
  return ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function valueEdges(root, filePath, sourceFile) {
  const edges = [];
  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier)) {
      if (!isTypeOnlyImport(statement)) {
        const target = resolveSourceModule(root, filePath, statement.moduleSpecifier.text);
        if (target) edges.push(target);
      }
    }
    if (ts.isExportDeclaration(statement) && statement.moduleSpecifier
      && ts.isStringLiteral(statement.moduleSpecifier) && !isTypeOnlyExport(statement)) {
      const target = resolveSourceModule(root, filePath, statement.moduleSpecifier.text);
      if (target) edges.push(target);
    }
  }
  return edges;
}

function collectGraph(root, entryFile) {
  const visited = new Set();
  const pending = [entryFile];
  let sourceBytes = 0;
  while (pending.length > 0) {
    const filePath = pending.pop();
    if (!filePath || visited.has(filePath)) continue;
    visited.add(filePath);
    sourceBytes += fs.statSync(filePath).size;
    for (const target of valueEdges(root, filePath, parseModule(filePath))) pending.push(target);
  }
  return { files: [...visited], sourceBytes };
}

function entryExports(root, entryFile) {
  const exports = [];
  for (const statement of parseModule(entryFile).statements) {
    if (!ts.isExportDeclaration(statement)) continue;
    if (!statement.exportClause || !ts.isNamedExports(statement.exportClause)) {
      throw new Error(`${relative(root, entryFile)} must use named exports; export-star/default boundaries are forbidden`);
    }
    if (!statement.moduleSpecifier || !ts.isStringLiteral(statement.moduleSpecifier)) {
      throw new Error(`${relative(root, entryFile)} must re-export directly from an owned source module`);
    }
    const target = resolveSourceModule(root, entryFile, statement.moduleSpecifier.text);
    if (!target) throw new Error(`${relative(root, entryFile)} has an unresolved or external export source`);
    for (const element of statement.exportClause.elements) {
      exports.push({
        name: element.name.text,
        kind: statement.isTypeOnly || element.isTypeOnly ? 'type' : 'value',
        source: manifestSource(root, target),
      });
    }
  }
  return exports;
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`);
}

function packageExportFor(output) {
  return {
    types: `./dist/${output}.d.ts`,
    import: `./dist/${output}.js`,
    require: `./dist/${output}.cjs`,
  };
}

function bannedBarrels(root) {
  return new Set([
    path.resolve(root, 'src/index.ts'),
    path.resolve(root, 'src/ui/index.ts'),
    ...[...UI_OWNERS].map((owner) => path.resolve(root, `src/ui/${owner}/index.ts`)),
  ]);
}

export function runPublicEntrypointGate({ root = DEFAULT_ROOT, silent = false } = {}) {
  const manifestPath = path.join(root, 'public-entrypoints.manifest.json');
  const packagePath = path.join(root, 'package.json');
  const vitePath = path.join(root, 'vite.config.ts');
  const manifest = readJson(manifestPath);
  const packageJson = readJson(packagePath);
  const viteSource = fs.readFileSync(vitePath, 'utf8');
  const failures = [];
  const reports = [];
  const claimedSymbols = new Map();
  const banned = bannedBarrels(root);
  let runtimeSymbols = 0;
  let typeSymbols = 0;

  if (manifest.schemaVersion !== 2) failures.push('manifest schemaVersion must be 2');
  if (manifest.package !== packageJson.name) failures.push('manifest package must match package.json name');
  if (!viteSource.includes('preserveModules: true') || !viteSource.includes("preserveModulesRoot: 'src'")) {
    failures.push('vite.config.ts must preserve modules from src');
  }

  for (const [subpath, entry] of Object.entries(manifest.entries ?? {})) {
    try {
      if (!OWNERS.has(entry.owner)) throw new Error(`${subpath} has invalid owner ${entry.owner}`);
      if (!['contracts', 'runtime'].includes(entry.boundary)) throw new Error(`${subpath} has invalid boundary`);
      assertEqual(subpath, `./${entry.owner}/${entry.family}`, `${subpath} owner/family path`);
      assertEqual(
        entry.source,
        `src/entrypoints/public/${entry.owner}/${entry.family}/index.ts`,
        `${subpath} wrapper source`,
      );
      assertEqual(
        entry.output,
        entry.source.slice(4).replace(/\.ts$/, ''),
        `${subpath} preserveModules output`,
      );
      if ((entry.owner === 'contracts') !== (entry.boundary === 'contracts')) {
        throw new Error(`${subpath} contracts ownership and boundary must agree`);
      }
      const entryFile = path.resolve(root, entry.source);
      if (!fs.existsSync(entryFile)) throw new Error(`${subpath} source is missing: ${entry.source}`);
      const entryText = fs.readFileSync(entryFile, 'utf8');
      const hasClientDirective = /^\s*['"]use client['"];/.test(entryText);
      if (entry.client === true && !hasClientDirective) throw new Error(`${subpath} client boundary must begin with 'use client'`);
      if (entry.client !== true && hasClientDirective) throw new Error(`${subpath} non-client boundary must remain directive-free`);

      const actualExports = entryExports(root, entryFile);
      const expectedExports = [...entry.symbols]
        .map(({ name, kind }) => ({ name, kind }))
        .sort((a, b) => a.name.localeCompare(b.name));
      const actualSurface = actualExports
        .map(({ name, kind }) => ({ name, kind }))
        .sort((a, b) => a.name.localeCompare(b.name));
      assertEqual(JSON.stringify(actualSurface), JSON.stringify(expectedExports), `${subpath} manifest exports`);
      if (entry.boundary === 'contracts' && actualExports.some((item) => item.kind !== 'type')) {
        throw new Error(`${subpath} contracts may export types only`);
      }
      for (const exported of actualExports) {
        if (UI_OWNERS.has(entry.owner) && !exported.source.startsWith(`src/ui/${entry.owner}/`)) {
          throw new Error(`${subpath} symbol ${exported.name} is outside owner ${entry.owner}`);
        }
        if (entry.owner === 'runtime' && exported.source.startsWith('src/ui/')) {
          throw new Error(`${subpath} runtime symbol ${exported.name} belongs to a UI owner`);
        }
      }
      for (const symbol of entry.symbols) {
        if (symbol.kind === 'type') typeSymbols += 1;
        else runtimeSymbols += 1;
        const prior = claimedSymbols.get(symbol.name);
        if (prior) throw new Error(`${symbol.name} is claimed by both ${prior} and ${subpath}`);
        claimedSymbols.set(symbol.name, subpath);
      }

      assertEqual(
        JSON.stringify(packageJson.exports?.[subpath]),
        JSON.stringify(packageExportFor(entry.output)),
        `${subpath} package export`,
      );
      assertEqual(
        packageJson.releaseSync?.sourceEntrypoints?.[subpath],
        entry.source.replace(/^src\//, ''),
        `${subpath} releaseSync source`,
      );
      if (!viteSource.includes("readFileSync(resolve(__dirname, 'public-entrypoints.manifest.json')")
        || !viteSource.includes('...publicEntries')) {
        throw new Error('vite.config.ts does not derive public entries from the governed manifest');
      }

      const directSources = new Set(actualExports.map((item) => item.source)).size;
      const graph = collectGraph(root, entryFile);
      const barrel = graph.files.find((filePath) => banned.has(filePath));
      if (barrel) throw new Error(`${subpath} reaches forbidden root/tier barrel ${relative(root, barrel)}`);
      if (directSources > entry.budget.maxDirectSources) {
        throw new Error(`${subpath} direct fan-out ${directSources} exceeds ${entry.budget.maxDirectSources}`);
      }
      if (graph.files.length > entry.budget.maxReachableModules) {
        throw new Error(`${subpath} reachable fan-out ${graph.files.length} exceeds ${entry.budget.maxReachableModules}`);
      }
      if (graph.sourceBytes > entry.budget.maxSourceBytes) {
        throw new Error(`${subpath} source bytes ${graph.sourceBytes} exceeds ${entry.budget.maxSourceBytes}`);
      }
      reports.push({ subpath, directSources, reachableModules: graph.files.length, sourceBytes: graph.sourceBytes });
    } catch (error) {
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  const governedSubpaths = new Set(Object.keys(manifest.entries ?? {}));
  for (const subpath of Object.keys(packageJson.exports ?? {})) {
    if ([...OWNERS].some((owner) => subpath.startsWith(`./${owner}/`)) && !governedSubpaths.has(subpath)) {
      failures.push(`${subpath} is public but absent from public-entrypoints.manifest.json`);
    }
  }
  if (JSON.stringify(packageJson.exports?.['./public-entrypoints-manifest'])
    !== JSON.stringify({ default: './public-entrypoints.manifest.json' })) {
    failures.push('./public-entrypoints-manifest export is missing or incorrect');
  }
  if (!(packageJson.files ?? []).includes('public-entrypoints.manifest.json')) {
    failures.push('public-entrypoints.manifest.json is absent from package files');
  }
  const coverage = { runtimeSymbols, typeSymbols, totalSymbols: runtimeSymbols + typeSymbols };
  if (JSON.stringify(manifest.coverage) !== JSON.stringify(coverage)) {
    failures.push(`manifest coverage is stale: expected ${JSON.stringify(coverage)}`);
  }

  /* El ancla de techos se resuelve contra `root`, no contra el directorio de
   * este script: el gate corre sobre arboles sinteticos en sus drills, y un
   * ancla clavada al script haria que un fixture de un subpath se comparara
   * contra los 77 del arbol real. Ausente o ilegible => FALLA: un verificador
   * que se calla cuando le falta su ancla reproduce el defecto que viene a
   * cerrar. */
  let ceilingsBaseline = null;
  try { ceilingsBaseline = readJson(path.join(root, CEILINGS_BASELINE_RELATIVE)); } catch { ceilingsBaseline = null; }
  for (const failure of evaluateCeilings(readCeilings(manifest), ceilingsBaseline)) {
    failures.push(`[techo] ${failure}`);
  }

  if (failures.length > 0) throw new Error(`Public entrypoint gate failed:\n- ${failures.join('\n- ')}`);
  if (!silent) {
    for (const report of reports) {
      console.log(`PASS ${report.subpath} direct=${report.directSources} reachable=${report.reachableModules} bytes=${report.sourceBytes}`);
    }
  }
  return reports;
}

/**
 * LA PUERTA PARA AMPLIAR, PEDIDA POR NOMBRE. Es el equivalente de
 * `--reattribution` del normalization-contract-gate, con la semantica de este
 * gate: `--widen`. Sin la bandera esta ruta se niega a ampliar, y ampliar es
 * tanto subir un techo existente como agregar un subpath nuevo.
 *
 * QUE GARANTIZA Y QUE NO. No vuelve imposible ampliar: quien edite el JSON del
 * ancla a mano consigue lo mismo, y ninguna bandera lo impide. Lo que consigue
 * es que la via NORMAL exija la razon y la deje escrita en `lastMoveKind`, y
 * que el `--check` del gate enrojezca ante cualquier desvio -- de modo que una
 * ampliacion sin razon es REVISABLE en el diff, no invisible. Esa es toda la
 * pretension, y conviene no decir de mas.
 *
 * Bajar no necesita bandera, pero SI razon: un ancla que baja sin decir que se
 * adelgazo no es auditable.
 */
export function writeCeilingsBaseline({ root = DEFAULT_ROOT, reason, widen = false } = {}) {
  if (!reason || !String(reason).trim()) throw new Error('--write-baseline exige --reason "por que se mueve el ancla"');
  const baselinePath = path.join(root, CEILINGS_BASELINE_RELATIVE);
  const previous = readJson(baselinePath);
  const live = readCeilings(readJson(path.join(root, 'public-entrypoints.manifest.json')));
  for (const [subpath, value] of Object.entries(live)) {
    if (!isValidCeiling(value)) throw new Error(`${subpath}: el techo vivo ${JSON.stringify(value)} no es un entero positivo; no se ancla basura`);
  }
  /* SUBIR NO ES LA UNICA FORMA DE AMPLIAR. Defecto de Codex: un subpath NUEVO no
   * tiene ancla previa, asi que la comparacion `value > anchored` no lo veia y
   * entraba por la puerta de bajada, registrado como "decrece-solo". Pero un
   * techo nuevo AGRANDA el conjunto gobernado tanto como subir uno existente: es
   * superficie publica que nadie reviso. Las dos formas de ampliar pasan por la
   * misma puerta y quedan con el mismo nombre.
   *
   * Y "SIN ANCLA" NO ES SOLO "SIN ENTRADA". Defecto de Fable, un paso mas alla
   * del anterior y medido en las seis formas: un ancla previa INVALIDA PERO
   * PRESENTE (`"x"`, `null`, `0`, `[]`, `{}`, `10.5`) no era `raised` --no es
   * valida-- ni `added` --no es `undefined`--, asi que `widening` quedaba vacio y
   * la escritura pasaba SIN `--widen`, etiquetada `decrece-solo`. Con el techo
   * vivo ya subido, eso LAVABA la subida: el ancla quedaba en el valor mayor y
   * `lastMoveKind` decia lo contrario de lo que habia pasado.
   *
   * Lo grave es que esa es la via NORMAL de reparacion: el `--check` enrojece por
   * ancla corrupta, alguien corre `--write-baseline --reason "reparo el ancla"`,
   * y la subida entra por la puerta de bajada. El propio gate ya declaraba que un
   * ancla corrupta "no gobierna nada" -- es decir, equivale a no-ancla-- y la
   * puerta no le aplicaba su propia ley. Por eso el filtro es por VALIDEZ, no por
   * presencia. */
  const raised = Object.entries(live)
    .filter(([subpath, value]) => {
      const anchored = previous?.ceilings?.[subpath];
      return isValidCeiling(anchored) && value > anchored;
    })
    .map(([subpath, value]) => `${subpath} (${previous.ceilings[subpath]} -> ${value})`);
  const added = Object.keys(live)
    .filter((subpath) => !isValidCeiling(previous?.ceilings?.[subpath]))
    /* El texto dice "sin ancla valida", no "nuevo": un subpath con ancla corrupta
     * ya existia, y llamarlo nuevo seria describir mal lo unico que el operador
     * va a leer antes de decidir si pide `--widen`. */
    .map((subpath) => `${subpath} (sin ancla valida, techo ${live[subpath]})`);
  const widening = [...raised, ...added];
  if (widening.length > 0 && !widen) {
    throw new Error(
      `me niego a AMPLIAR el ancla en ${widening.length} techo(s): ${widening.join(', ')}`
      + '. Un grafo que engorda se adelgaza en la fuente, y un subpath sin ancla valida se revisa antes de anclarse.'
      + ' Si la ampliacion esta autorizada, pedila por nombre: --widen --reason "..."',
    );
  }
  const doc = {
    ...previous,
    ceilings: Object.fromEntries(Object.entries(live).sort(([a], [b]) => a.localeCompare(b))),
    lastMove: reason,
    lastMoveKind: widening.length > 0
      ? `ampliacion autorizada por nombre (--widen): ${raised.length} techo(s) subido(s), ${added.length} sin ancla valida`
      : 'decrece-solo',
  };
  fs.writeFileSync(baselinePath, `${JSON.stringify(doc, null, 2)}\n`);
  return {
    raised: raised.map((item) => item.split(' ')[0]),
    added: added.map((item) => item.split(' ')[0]),
    total: Object.keys(live).length,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const flags = process.argv.slice(2);
  if (flags.includes('--write-baseline')) {
    const reasonIndex = flags.indexOf('--reason');
    try {
      const result = writeCeilingsBaseline({
        reason: reasonIndex >= 0 ? flags[reasonIndex + 1] : null,
        widen: flags.includes('--widen'),
      });
      const widened = result.raised.length + result.added.length;
      console.log(`ancla de techos escrita: ${result.total} subpaths${widened > 0 ? `, ${result.raised.length} subido(s) y ${result.added.length} sin ancla valida, por --widen` : ''}`);
    } catch (error) {
      console.error(`public-entrypoint-boundary-gate: ${error.message}`);
      process.exit(1);
    }
  } else {
    runPublicEntrypointGate();
  }
}
