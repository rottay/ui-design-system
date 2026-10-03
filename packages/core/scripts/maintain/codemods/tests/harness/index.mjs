import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEFAULT_MAP, loadMap, runCodemods } from '../../index.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

export const KIT_ROOT = path.resolve(HERE, '../..');
export const FIXTURES = path.join(KIT_ROOT, 'fixtures');

function stubSurface(file) {
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
  const isPublished = (subpath) => raw.published.some((key) => {
    if (!key.includes('*')) return key === subpath;
    const [head, tail] = key.split('*');
    return subpath.length > head.length + tail.length && subpath.startsWith(head) && subpath.endsWith(tail);
  });
  return {
    published: raw.published,
    isPublished,
    exportsOf: (subpath) => (raw.exports[subpath] ? new Set(raw.exports[subpath]) : null),
  };
}

function firstExisting(...candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) ?? null;
}

/** Every `fixtures/<class>/<case>/input` tree, with the map and surface the case runs under. */
export function loadFixtureCases() {
  const cases = [];
  for (const className of fs.readdirSync(FIXTURES).sort()) {
    const classRoot = path.join(FIXTURES, className);
    if (!fs.statSync(classRoot).isDirectory()) continue;
    for (const caseName of fs.readdirSync(classRoot).sort()) {
      const caseRoot = path.join(classRoot, caseName);
      if (!fs.existsSync(path.join(caseRoot, 'input'))) continue;
      const surfaceFile = firstExisting(path.join(caseRoot, 'surface.json'), path.join(classRoot, 'surface.json'));
      cases.push({
        name: `${className}/${caseName}`,
        className,
        caseName,
        input: path.join(caseRoot, 'input'),
        expected: path.join(caseRoot, 'expected'),
        report: path.join(caseRoot, 'report.json'),
        mapPath: firstExisting(path.join(caseRoot, 'map.json'), path.join(classRoot, 'map.json')) ?? DEFAULT_MAP,
        surface: surfaceFile ? stubSurface(surfaceFile) : null,
      });
    }
  }
  return cases;
}

export function workingCopy(fixture) {
  const work = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'codemods-')));
  fs.cpSync(fixture.input, work, { recursive: true });
  return work;
}

export function snapshot(root) {
  const files = {};
  const visit = (directory) => {
    for (const item of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const target = path.join(directory, item.name);
      if (item.isDirectory()) visit(target);
      else files[path.relative(root, target).split(path.sep).join('/')] = fs.readFileSync(target, 'utf8');
    }
  };
  visit(root);
  return files;
}

export function rowsOf(result, root) {
  return result.findings.map((item) => ({
    file: path.relative(root, item.file).split(path.sep).join('/'),
    line: item.line,
    column: item.column,
    action: item.action,
    id: item.id,
    reason: item.reason,
  }));
}

export function runCase(fixture, work, options = {}) {
  const result = runCodemods({
    operands: [work],
    map: loadMap(fixture.mapPath),
    surface: fixture.surface,
    cwd: work,
    ...options,
  });
  return { result, rows: rowsOf(result, work) };
}
