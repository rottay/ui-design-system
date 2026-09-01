import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';

export const SURFACE_CAPABILITY_CENSUS_VERSION = 1;
export const SURFACE_CAPABILITY_KINDS = Object.freeze([
  'route',
  'field',
  'column',
  'tab',
  'action',
]);

const SOURCE_EXTENSIONS = /\.(?:ts|tsx)$/;
const NON_PRODUCT_SOURCE = /(?:^|\/)(?:__tests__|__fixtures__|test|tests|stories)(?:\/|$)|\.(?:test|spec|stories)\.[^.]+$/;
const CONTAINER_KIND = new Map([
  ['fields', 'field'],
  ['field', 'field'],
  ['columns', 'column'],
  ['columnDefs', 'column'],
  ['actions', 'action'],
  ['rowActions', 'action'],
  ['headerActions', 'action'],
  ['bulkActions', 'action'],
  ['itemActions', 'action'],
  ['resultActions', 'action'],
  ['primaryAction', 'action'],
  ['secondaryAction', 'action'],
  ['submitAction', 'action'],
  ['cancelAction', 'action'],
  ['saveDraftAction', 'action'],
  ['tabs', 'tab'],
  ['views', 'tab'],
]);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function listProductSourceFiles(directory) {
  const files = [];

  async function visit(current) {
    const entries = await readdir(current, { withFileTypes: true });
    entries.sort((left, right) => left.name.localeCompare(right.name));

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
        continue;
      }

      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await visit(absolute);
        continue;
      }

      const relative = toPosix(path.relative(directory, absolute));
      if (
        SOURCE_EXTENSIONS.test(entry.name) &&
        !entry.name.endsWith('.d.ts') &&
        !NON_PRODUCT_SOURCE.test(relative)
      ) {
        files.push({ absolute, relative });
      }
    }
  }

  await visit(directory);
  return files;
}

function propertyName(node) {
  if (!node) return undefined;
  if (ts.isIdentifier(node) || ts.isStringLiteralLike(node) || ts.isNumericLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function propertyMap(objectLiteral) {
  const properties = new Map();
  for (const property of objectLiteral.properties) {
    if (!ts.isPropertyAssignment(property) && !ts.isShorthandPropertyAssignment(property)) continue;
    const name = propertyName(property.name);
    if (name) properties.set(name, property);
  }
  return properties;
}

function literalValue(property) {
  if (!property || !ts.isPropertyAssignment(property)) return undefined;
  const { initializer } = property;
  if (ts.isStringLiteralLike(initializer) || ts.isNumericLiteral(initializer)) {
    return String(initializer.text).trim();
  }
  if (ts.isNoSubstitutionTemplateLiteral(initializer)) {
    return initializer.text.trim();
  }
  return undefined;
}

function nearestContainerKind(node) {
  let current = node.parent;
  while (current) {
    if (ts.isPropertyAssignment(current)) {
      const resolved = CONTAINER_KIND.get(propertyName(current.name));
      if (resolved) return resolved;
    }
    if (ts.isVariableDeclaration(current)) {
      const name = propertyName(current.name);
      if (name) {
        const lower = name.toLowerCase();
        if (lower.includes('column')) return 'column';
        if (lower.includes('field')) return 'field';
        if (lower.includes('action')) return 'action';
        if (lower.includes('tab')) return 'tab';
      }
    }
    if (ts.isSourceFile(current) || ts.isFunctionLike(current)) break;
    current = current.parent;
  }
  return undefined;
}

function capabilityId(kind, properties) {
  const candidates =
    kind === 'field'
      ? ['fieldId', 'id', 'name', 'key']
      : kind === 'column'
        ? ['fieldId', 'id', 'key', 'accessorKey']
        : kind === 'tab'
        ? ['capabilityId', 'permissionId', 'id', 'key']
          : ['id', 'key'];

  for (const candidate of candidates) {
    const value = literalValue(properties.get(candidate));
    if (value) return value;
  }
  return undefined;
}

function sourceLocation(sourceFile, node) {
  const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return { line: position.line + 1, column: position.character + 1 };
}

function nextRouteFromPage(relative) {
  const normalized = toPosix(relative);
  if (!/(?:^|\/)app\/.*\/page\.(?:ts|tsx)$/.test(normalized) && !/^app\/page\.(?:ts|tsx)$/.test(normalized)) {
    return undefined;
  }

  const afterApp = normalized.replace(/^app\//, '').replace(/(?:^|\/)page\.(?:ts|tsx)$/, '');
  const segments = afterApp
    .split('/')
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith('(') && segment.endsWith(')')))
    .filter((segment) => !segment.startsWith('@'));
  return `/${segments.join('/')}`.replace(/\/$/, '') || '/';
}

function pagesRouteFromPage(relative) {
  const normalized = toPosix(relative);
  if (!normalized.startsWith('pages/') || !/\.(?:ts|tsx)$/.test(normalized)) return undefined;
  if (normalized.startsWith('pages/api/') || /\/(?:_app|_document|_error)\.(?:ts|tsx)$/.test(normalized)) {
    return undefined;
  }
  const route = normalized
    .replace(/^pages\//, '')
    .replace(/\.(?:ts|tsx)$/, '')
    .replace(/\/index$/, '');
  return `/${route}`.replace(/\/$/, '') || '/';
}

function scanSourceFile(sourceRoot, file, sourceText) {
  const sourceFile = ts.createSourceFile(
    file.relative,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    file.relative.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
  const entries = [];
  const route = nextRouteFromPage(file.relative) ?? pagesRouteFromPage(file.relative);
  if (route) {
    entries.push({ kind: 'route', id: route, source: file.relative, line: 1, column: 1 });
  }

  function visit(node) {
    if (ts.isObjectLiteralExpression(node)) {
      const properties = propertyMap(node);
      const explicitKind = literalValue(properties.get('kind'));
      const kind = SURFACE_CAPABILITY_KINDS.includes(explicitKind)
        ? explicitKind
        : nearestContainerKind(node);

      if (kind && kind !== 'route') {
        const id = capabilityId(kind, properties);
        if (id) {
          const location = sourceLocation(sourceFile, node);
          entries.push({ kind, id, source: file.relative, ...location });
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return entries;
}

export async function buildSurfaceCapabilityCensus(repoRoot) {
  const sourceRoot = path.join(repoRoot, 'src');
  const files = await listProductSourceFiles(sourceRoot);
  const entries = [];

  for (const file of files) {
    const sourceText = await readFile(file.absolute, 'utf8');
    entries.push(...scanSourceFile(sourceRoot, file, sourceText));
  }

  const unique = new Map();
  for (const entry of entries) {
    const key = `${entry.kind}\u0000${entry.id}\u0000${entry.source}\u0000${entry.line}\u0000${entry.column}`;
    unique.set(key, entry);
  }

  const ordered = [...unique.values()].sort((left, right) =>
    left.kind.localeCompare(right.kind) ||
    left.id.localeCompare(right.id) ||
    left.source.localeCompare(right.source) ||
    left.line - right.line ||
    left.column - right.column
  );
  const counts = Object.fromEntries(
    SURFACE_CAPABILITY_KINDS.map((kind) => [kind, ordered.filter((entry) => entry.kind === kind).length]),
  );

  return {
    schemaVersion: SURFACE_CAPABILITY_CENSUS_VERSION,
    app: path.basename(repoRoot),
    source: 'generated-from-productive-typescript',
    counts,
    total: ordered.length,
    entries: ordered,
  };
}

export function serializeSurfaceCapabilityCensus(census) {
  return `${JSON.stringify(census, null, 2)}\n`;
}
