import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { packageRoot as findPackageRoot } from '../../lib/repo-root/index.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = findPackageRoot(SCRIPT_DIR);
const DEFAULT_MANIFEST = path.join(CORE_ROOT, 'public-entrypoints.manifest.json');

export function createSymbolMap(manifest) {
  const symbols = new Map();
  for (const [subpath, entry] of Object.entries(manifest.entries)) {
    for (const symbol of entry.symbols) {
      if (symbols.has(symbol.name)) throw new Error(`Duplicate governed symbol ${symbol.name}`);
      symbols.set(symbol.name, { subpath, kind: symbol.kind });
    }
  }
  return symbols;
}

function namedImportText(imported, local) {
  return imported === local ? imported : `${imported} as ${local}`;
}

export function transformPublicImports(source, manifest) {
  const sourceFile = ts.createSourceFile('consumer.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const symbolMap = createSymbolMap(manifest);
  const replacements = [];
  let migratedSymbols = 0;

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)
      || !ts.isStringLiteral(statement.moduleSpecifier)
      || statement.moduleSpecifier.text !== manifest.package) continue;
    const clause = statement.importClause;
    if (!clause?.namedBindings || !ts.isNamedImports(clause.namedBindings)) continue;

    const retained = [];
    const grouped = new Map();
    for (const element of clause.namedBindings.elements) {
      const imported = (element.propertyName ?? element.name).text;
      const mapping = symbolMap.get(imported);
      if (!mapping) {
        retained.push(element.getText(sourceFile));
        continue;
      }
      const target = `${manifest.package}${mapping.subpath.slice(1)}`;
      const typeOnly = clause.isTypeOnly || element.isTypeOnly || mapping.kind === 'type';
      const key = `${typeOnly ? 'type' : 'value'}\0${target}`;
      const group = grouped.get(key) ?? { target, typeOnly, specifiers: [] };
      group.specifiers.push(namedImportText(imported, element.name.text));
      grouped.set(key, group);
      migratedSymbols += 1;
    }
    if (grouped.size === 0) continue;

    const quote = source[statement.moduleSpecifier.getStart(sourceFile)] === '"' ? '"' : "'";
    const lines = [];
    if (clause.name || retained.length > 0) {
      const pieces = [];
      if (clause.name) pieces.push(clause.name.text);
      if (retained.length > 0) pieces.push(`{ ${retained.join(', ')} }`);
      lines.push(`import ${clause.isTypeOnly ? 'type ' : ''}${pieces.join(', ')} from ${quote}${manifest.package}${quote};`);
    }
    const groups = [...grouped.values()].sort((left, right) => left.target.localeCompare(right.target));
    for (const group of groups) {
      group.specifiers.sort();
      lines.push(`import ${group.typeOnly ? 'type ' : ''}{ ${group.specifiers.join(', ')} } from ${quote}${group.target}${quote};`);
    }
    replacements.push({ start: statement.getStart(sourceFile), end: statement.end, text: lines.join('\n') });
  }

  let output = source;
  for (const replacement of replacements.sort((left, right) => right.start - left.start)) {
    output = `${output.slice(0, replacement.start)}${replacement.text}${output.slice(replacement.end)}`;
  }
  return { source: output, changed: replacements.length > 0, migratedSymbols };
}

function collectFiles(target, files) {
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (/\.[cm]?[jt]sx?$/.test(target)) files.push(target);
    return;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    if (['node_modules', '.next', 'dist', 'coverage', '.git'].includes(entry.name)) continue;
    collectFiles(path.join(target, entry.name), files);
  }
}

function runCli() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const check = args.includes('--check');
  const manifestFlag = args.indexOf('--manifest');
  const manifestPath = manifestFlag >= 0 ? path.resolve(args[manifestFlag + 1]) : DEFAULT_MANIFEST;
  const operands = args.filter((arg, index) => !['--write', '--check'].includes(arg)
    && arg !== '--manifest' && !(manifestFlag >= 0 && index === manifestFlag + 1));
  if (operands.length === 0) {
    throw new Error('Usage: migrate-public-entrypoints.mjs [--write|--check] <file-or-directory> [...]');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const files = [];
  for (const operand of operands) collectFiles(path.resolve(operand), files);
  let changedFiles = 0;
  let migratedSymbols = 0;
  for (const file of files) {
    const original = fs.readFileSync(file, 'utf8');
    const result = transformPublicImports(original, manifest);
    if (!result.changed) continue;
    changedFiles += 1;
    migratedSymbols += result.migratedSymbols;
    if (write) fs.writeFileSync(file, result.source);
    console.log(`${write ? 'MIGRATED' : 'WOULD_MIGRATE'} ${file} (${result.migratedSymbols} symbols)`);
  }
  console.log(`${write ? 'migrated' : 'planned'} files=${changedFiles} symbols=${migratedSymbols}`);
  if (check && changedFiles > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) runCli();
