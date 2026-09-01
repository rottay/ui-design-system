import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, join, relative, sep } from 'node:path';

const PATH_ALIASES = new Map([
  ['recipe-profile', 'recipes/profile'],
  ['token-overrides', 'tokens/overrides'],
]);

const CSS_LOCATOR = /(?:packages\/core\/)?src\/[A-Za-z0-9_./-]+\.css(?=[:#]|$)/gu;

function folderIndexCandidate(pathname) {
  const extension = extname(pathname);
  return join(dirname(pathname), basename(pathname, extension), `index${extension}`)
    .split(sep)
    .join('/');
}

/**
 * Reanchors CSS locators after a mechanical `file.css` -> `file/index.css` move.
 * Line/symbol suffixes and surrounding prose stay byte-for-byte unchanged.
 */
export function reanchorFolderIndexCssLocators(value, { repositoryRoot, packageRoot }) {
  if (typeof value === 'string') {
    return value.replace(CSS_LOCATOR, (pathname) => {
      const root = pathname.startsWith('packages/core/') ? repositoryRoot : packageRoot;
      const absolute = join(root, pathname);
      if (existsSync(absolute)) return pathname;
      const candidate = folderIndexCandidate(pathname);
      const candidateAbsolute = join(root, candidate);
      return existsSync(candidateAbsolute) && statSync(candidateAbsolute).isFile()
        ? candidate
        : pathname;
    });
  }
  if (Array.isArray(value)) {
    return value.map((entry) =>
      reanchorFolderIndexCssLocators(entry, { repositoryRoot, packageRoot })
    );
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        reanchorFolderIndexCssLocators(entry, { repositoryRoot, packageRoot }),
      ]),
    );
  }
  return value;
}

export function pathForManifestId(id) {
  if (PATH_ALIASES.has(id)) return PATH_ALIASES.get(id);
  if (!/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/u.test(id)) {
    throw new Error(`invalid manifest id: ${String(id)}`);
  }
  return id.replaceAll('.', '/');
}

export function indexJsonFiles(root) {
  if (!existsSync(root)) return [];
  const files = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name))) {
      const pathname = join(directory, entry.name);
      if (entry.isDirectory()) walk(pathname);
      else if (entry.isFile() && entry.name === 'index.json') files.push(pathname);
      else throw new Error(`unexpected manifest entry: ${pathname}`);
    }
  };
  walk(root);
  return files;
}

export function readManifestRecords(root, idField) {
  const records = [];
  const ids = new Set();
  for (const pathname of indexJsonFiles(root)) {
    const document = JSON.parse(readFileSync(pathname, 'utf8'));
    const id = document?.[idField];
    if (typeof id !== 'string' || id.length === 0) {
      throw new Error(`${pathname} is missing ${idField}`);
    }
    if (ids.has(id)) throw new Error(`duplicate ${idField}: ${id}`);
    ids.add(id);
    const observed = relative(root, pathname).split(sep).join('/');
    const expected = `${pathForManifestId(id)}/index.json`;
    if (observed !== expected) {
      throw new Error(`${idField} ${id} must live at ${expected}, found ${observed}`);
    }
    records.push({ id, document, pathname, relativePath: observed });
  }
  return records;
}
