/**
 * Codemod: replace an application's hand-assembled tenant-theme mount with the
 * single `mountTenantTheme` call.
 *
 * WHAT IT REPLACES. Every app grew the same three files around the same three
 * pieces -- `runtime-tenant-theme/{ssr,contracts,artifact-resolution}` -- and
 * then spent its root layout re-assembling them: one call for the root
 * attributes, a second guarded branch to hand-write the artifact `<style>`, and
 * a hand-typed `data-tenant`/`data-digest` pair the mount proof does not read
 * (X-02 of `audit/70-plan/risks`). After this codemod the layout reads
 * `rootAttributes` and `styleElements` off ONE call and stamps nothing of its
 * own; the trio keeps only what the design system cannot own, which is the
 * app's own database read.
 *
 * WHAT IT REFUSES. Every operation is matched against an exact shape. A layout
 * that does not carry that shape is REPORTED with the reason and left
 * untouched; nothing is guessed, because a half-migrated mount emits a scope
 * the resolver cannot admit and looks exactly like a slow load.
 *
 * Usage:
 *   node index.mjs --file <layout.tsx> --vertical bithire \
 *     [--artifact <expr>] [--document <expr>] \
 *     [--theme-mode <expr>] [--locale <expr>] [--write]
 */
import fs from 'node:fs';
import ts from 'typescript';

const SERVER_ENTRYPOINT = '@rottay/design-system/server';

/** Named imports this codemod adds to, and removes from, the server import. */
const ADDED_STATIC = ['mountTenantTheme', 'staticThemeIntent'];
const ADDED_DOCUMENT = 'documentThemeIntent';
const REMOVED = ['resolveDocumentRootAttributes'];

class Refusal extends Error {}

function refuse(message) {
  throw new Refusal(message);
}

function indentOf(source, node, sourceFile) {
  const { character } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
  return ' '.repeat(character);
}

function collect(node, predicate, found = []) {
  if (predicate(node)) found.push(node);
  // `forEachChild` stops on the first truthy return, so the visitor must not
  // return the accumulator it is building.
  node.forEachChild((child) => {
    collect(child, predicate, found);
  });
  return found;
}

function isCallTo(node, name) {
  return (
    ts.isCallExpression(node)
    && ts.isIdentifier(node.expression)
    && node.expression.text === name
  );
}

/** The `<style>` an app hand-wrote for the compiled artifact, by its own proof attribute. */
function isHandWrittenArtifactStyle(node) {
  if (!ts.isJsxSelfClosingElement(node) && !ts.isJsxOpeningElement(node)) return false;
  if (!ts.isIdentifier(node.tagName) || node.tagName.text !== 'style') return false;
  return node.attributes.properties.some(
    (attribute) =>
      ts.isJsxAttribute(attribute)
      && ts.isIdentifier(attribute.name)
      && attribute.name.text === 'dangerouslySetInnerHTML',
  );
}

function serverImports(sourceFile) {
  return sourceFile.statements.filter((statement) => (
    ts.isImportDeclaration(statement)
    && ts.isStringLiteral(statement.moduleSpecifier)
    && statement.moduleSpecifier.text === SERVER_ENTRYPOINT
    && statement.importClause?.namedBindings
    && ts.isNamedImports(statement.importClause.namedBindings)
  ));
}

/**
 * Merge every named import from the server entrypoint into the first one.
 *
 * A layout that reached for the entrypoint twice -- app-bithire does, once for
 * the tenant registry and once for the root-attribute projection -- would
 * otherwise keep a second declaration still importing the name this codemod
 * exists to stop calling.
 */
function rewriteServerImports(source, sourceFile, statements, withDocumentIntent) {
  const kept = [];
  for (const statement of statements) {
    for (const element of statement.importClause.namedBindings.elements) {
      const text = element.getText(sourceFile);
      if (!REMOVED.includes(text.trim())) kept.push(text);
    }
  }
  const added = withDocumentIntent ? [...ADDED_STATIC, ADDED_DOCUMENT] : [...ADDED_STATIC];
  const names = [...new Set([...kept, ...added])].sort((left, right) => left.localeCompare(right));
  const quote = source[statements[0].moduleSpecifier.getStart(sourceFile)];
  const replacements = [{
    start: statements[0].getStart(sourceFile),
    end: statements[0].getEnd(),
    text: `import {\n${names.map((name) => `  ${name},`).join('\n')}\n} from ${quote}${SERVER_ENTRYPOINT}${quote};`,
  }];
  for (const statement of statements.slice(1)) {
    const trailingNewline = source[statement.getEnd()] === '\n' ? 1 : 0;
    replacements.push({ start: statement.getStart(sourceFile), end: statement.getEnd() + trailingNewline, text: '' });
  }
  return replacements;
}

function intentExpression(options, indent) {
  const staticIntent = `staticThemeIntent(${JSON.stringify(options.vertical)})`;
  if (!options.artifact) return staticIntent;
  if (!options.document) {
    refuse(
      'a compiled artifact was supplied without a --document expression: `mountTenantTheme` takes a ThemeIntent, and only `documentThemeIntent` can name a tenant-authored one',
    );
  }
  return (
    `${options.artifact}\n${indent}    ? documentThemeIntent({\n`
    + `${indent}        vertical: ${JSON.stringify(options.vertical)},\n`
    + `${indent}        slug: ${options.artifact}.slug,\n`
    + `${indent}        document: ${options.document},\n`
    + `${indent}      })\n${indent}    : ${staticIntent}`
  );
}

function mountOptionsExpression(options, indent) {
  const entries = [];
  if (options.themeMode) entries.push(`themeMode: ${options.themeMode}`);
  if (options.locale) entries.push(`locale: ${options.locale}`);
  if (options.artifact) entries.push(`artifact: ${options.artifact}`);
  if (entries.length === 0) return '';
  return `,\n${indent}  { ${entries.join(', ')} }`;
}

/**
 * Rewrite one root layout.
 *
 * Returns the transformed source plus the operations it applied. A refusal is
 * thrown rather than returned partially applied: the caller must be able to
 * leave the file exactly as it found it.
 */
export function transformRootLayout(source, options) {
  if (!options?.vertical) refuse('a --vertical is required: the intent NAMES its baseline');
  const sourceFile = ts.createSourceFile('layout.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const replacements = [];
  const operations = [];

  const rootAttributeCalls = collect(sourceFile, (node) => isCallTo(node, 'resolveDocumentRootAttributes'));
  if (rootAttributeCalls.length !== 1) {
    refuse(
      `expected exactly one resolveDocumentRootAttributes(...) call to replace, found ${rootAttributeCalls.length}`,
    );
  }
  let mountStatement = rootAttributeCalls[0];
  while (mountStatement && !ts.isVariableStatement(mountStatement)) mountStatement = mountStatement.parent;
  if (!mountStatement) refuse('the resolveDocumentRootAttributes(...) call is not bound by a variable statement');

  const declaration = mountStatement.declarationList.declarations[0];
  if (!declaration || !ts.isIdentifier(declaration.name)) {
    refuse('the resolveDocumentRootAttributes(...) result must be bound to a single name');
  }
  const projectionName = declaration.name.text;

  let enclosing = mountStatement;
  while (enclosing && !ts.isFunctionDeclaration(enclosing) && !ts.isArrowFunction(enclosing)) {
    enclosing = enclosing.parent;
  }
  const isAsync = enclosing?.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.AsyncKeyword);
  if (!isAsync) refuse('the layout component must be `async` before it can await mountTenantTheme');

  const indent = indentOf(source, mountStatement, sourceFile);
  replacements.push({
    start: mountStatement.getStart(sourceFile),
    end: mountStatement.getEnd(),
    text:
      `const { rootAttributes, styleElements } = await mountTenantTheme(\n`
      + `${indent}  ${intentExpression(options, indent)}${mountOptionsExpression(options, indent)},\n`
      + `${indent});`,
  });
  operations.push('mount-call');

  // The layout that split `lang`/`dir` out of the old projection now splits
  // them out of the mount's, so `jsx-a11y/html-has-lang` still sees them.
  for (const node of collect(sourceFile, (candidate) => (
    ts.isIdentifier(candidate)
    && candidate.text === projectionName
    && candidate.getStart(sourceFile) > mountStatement.getEnd()
  ))) {
    replacements.push({ start: node.getStart(sourceFile), end: node.getEnd(), text: 'rootAttributes' });
    operations.push('projection-reference');
  }

  const styles = collect(sourceFile, isHandWrittenArtifactStyle);
  if (styles.length !== 1) {
    refuse(`expected exactly one hand-written tenant-theme <style> element, found ${styles.length}`);
  }
  let styleNode = styles[0].parent;
  // The element is guarded by `artifact ? (<style .../>) : null`; the guard goes
  // with it, because `styleElements` is already empty when there is nothing.
  while (styleNode && !ts.isConditionalExpression(styleNode) && !ts.isJsxExpression(styleNode)) {
    styleNode = styleNode.parent;
  }
  if (!styleNode) refuse('the tenant-theme <style> element is not embedded in a JSX expression');
  // Indent from the enclosing `{...}` rather than the expression inside it: the
  // expression starts one column right of the brace that stays in place.
  let styleIndentNode = styleNode;
  while (styleIndentNode && !ts.isJsxExpression(styleIndentNode)) styleIndentNode = styleIndentNode.parent;
  const styleIndent = indentOf(source, styleIndentNode ?? styleNode, sourceFile);
  replacements.push({
    start: styleNode.getStart(sourceFile),
    end: styleNode.getEnd(),
    text:
      `styleElements.map((element) => (\n`
      + `${styleIndent}  <style\n`
      + `${styleIndent}    key={element.id}\n`
      + `${styleIndent}    {...element.attributes}\n`
      + `${styleIndent}    dangerouslySetInnerHTML={{ __html: element.css }}\n`
      + `${styleIndent}  />\n`
      + `${styleIndent}))`,
  });
  operations.push('style-elements');

  const serverStatements = serverImports(sourceFile);
  if (serverStatements.length === 0) refuse(`no named import from ${SERVER_ENTRYPOINT} to extend`);
  replacements.push(...rewriteServerImports(source, sourceFile, serverStatements, Boolean(options.artifact)));
  operations.push('server-import');

  let output = source;
  for (const replacement of [...replacements].sort((left, right) => right.start - left.start)) {
    output = output.slice(0, replacement.start) + replacement.text + output.slice(replacement.end);
  }

  // Anything the app imported ONLY for the mount it no longer performs is dead.
  // Reported by name rather than deleted blind: the same symbol may be used by
  // a route this codemod never saw.
  const orphaned = orphanedImports(output);
  return { source: output, operations, orphanedImports: orphaned };
}

/** Named imports whose local binding no longer appears anywhere in the body. */
export function orphanedImports(source) {
  const sourceFile = ts.createSourceFile('layout.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const orphaned = [];
  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement)
      || !statement.importClause?.namedBindings
      || !ts.isNamedImports(statement.importClause.namedBindings)
    ) continue;
    for (const element of statement.importClause.namedBindings.elements) {
      const name = element.name.text;
      const uses = collect(sourceFile, (node) => (
        ts.isIdentifier(node)
        && node.text === name
        && node.getStart(sourceFile) > statement.getEnd()
      ));
      if (uses.length === 0) {
        orphaned.push({ name, module: statement.moduleSpecifier.text });
      }
    }
  }
  return orphaned;
}

function readArgument(argv, flag) {
  const index = argv.indexOf(flag);
  return index === -1 ? undefined : argv[index + 1];
}

function main(argv) {
  const file = readArgument(argv, '--file');
  if (!file) {
    process.stderr.write('usage: index.mjs --file <layout.tsx> --vertical <id> [--artifact <expr>] [--document <expr>] [--theme-mode <expr>] [--locale <expr>] [--write]\n');
    return 2;
  }
  const options = {
    vertical: readArgument(argv, '--vertical'),
    artifact: readArgument(argv, '--artifact'),
    document: readArgument(argv, '--document'),
    themeMode: readArgument(argv, '--theme-mode'),
    locale: readArgument(argv, '--locale'),
  };
  const source = fs.readFileSync(file, 'utf8');
  let result;
  try {
    result = transformRootLayout(source, options);
  } catch (error) {
    if (!(error instanceof Refusal)) throw error;
    process.stderr.write(`mount-tenant-theme: refused ${file}\n  ${error.message}\n`);
    return 1;
  }
  if (argv.includes('--write')) fs.writeFileSync(file, result.source);
  process.stdout.write(
    `mount-tenant-theme: ${argv.includes('--write') ? 'rewrote' : 'planned'} ${file}\n`
    + `  operations: ${result.operations.join(', ')}\n`
    + (result.orphanedImports.length > 0
      ? `  now unreferenced (remove by hand, and delete the trio file that only served them):\n`
        + result.orphanedImports.map((entry) => `    ${entry.name} from ${entry.module}\n`).join('')
      : '  now unreferenced: none\n'),
  );
  return 0;
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  process.exit(main(process.argv.slice(2)));
}
