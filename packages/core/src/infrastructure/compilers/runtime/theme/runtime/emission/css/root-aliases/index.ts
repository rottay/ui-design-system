import {
  CONTAINER_ALIAS_CONTEXTS,
  CONTAINER_ALIASES,
  type ContainerAliasContext,
  ROOT_ALIASES,
  VERTICAL_OUTRIGHT,
} from "./generated";

export { CONTAINER_ALIAS_CONTEXTS, CONTAINER_ALIASES, ROOT_ALIASES, VERTICAL_OUTRIGHT };
export type { ContainerAlias, ContainerAliasContext, ContainerAliasExclusion } from "./generated";

const readsOf = (value: string): string[] => [
  ...new Set([...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1] as string)),
];

/** The tabled aliases a vertical's own element rules state with other text than the root's. */
export function verticalOutright(verticalKey: string): readonly string[] {
  return Object.prototype.hasOwnProperty.call(VERTICAL_OUTRIGHT, verticalKey) ? VERTICAL_OUTRIGHT[verticalKey] : [];
}

let readersOf: Map<string, string[]> | undefined;

/** operand -> the root aliases that read it, each alias listed once per operand. */
function readers(): Map<string, string[]> {
  if (readersOf) return readersOf;
  readersOf = new Map();
  for (const [name, value] of ROOT_ALIASES) {
    for (const operand of readsOf(value)) {
      const list = readersOf.get(operand);
      if (list) list.push(name);
      else readersOf.set(operand, [name]);
    }
  }
  return readersOf;
}

/**
 * A custom property resolves its `var()` where it is declared, so an alias
 * declared only at `:root` paints the root's operands under every nested scope.
 * Every root alias that reads a `stated` name, directly or through another such
 * alias, is restated with its root text in dependency order; a name in
 * `outright` keeps the scope's own value and still carries the re-resolution on.
 */
export function rootAliasRedeclarations(
  stated: Iterable<string>,
  outright: ReadonlySet<string>
): Record<string, string> {
  const index = readers();
  const reached = new Set<string>();
  const queue = [...stated];
  while (queue.length > 0) {
    for (const alias of index.get(queue.pop() as string) ?? []) {
      if (reached.has(alias)) continue;
      reached.add(alias);
      queue.push(alias);
    }
  }
  const restated: Record<string, string> = {};
  if (reached.size === 0) return restated;
  for (const [name, value] of ROOT_ALIASES) {
    if (reached.has(name) && !outright.has(name)) restated[name] = value;
  }
  return restated;
}

let aliasTexts: Map<string, string[]> | undefined;

/** alias -> every text the root gives it: a tabled root text, or a left-out alias's winning text and its context texts. */
function rootAliasTexts(): Map<string, string[]> {
  if (aliasTexts) return aliasTexts;
  aliasTexts = new Map(ROOT_ALIASES.map(([name, value]) => [name, [value]]));
  for (const alias of CONTAINER_ALIASES) aliasTexts.set(alias.name, [alias.value]);
  for (const context of CONTAINER_ALIAS_CONTEXTS) aliasTexts.get(context.name)?.push(context.value);
  return aliasTexts;
}

let containerReadersOf: Map<string, string[]> | undefined;

/** operand -> every root alias, tabled or left out, one of whose texts reads it. */
function containerReaders(): Map<string, string[]> {
  if (containerReadersOf) return containerReadersOf;
  containerReadersOf = new Map();
  for (const [name, texts] of rootAliasTexts()) {
    for (const operand of new Set(texts.flatMap(readsOf))) {
      const list = containerReadersOf.get(operand);
      if (list) list.push(name);
      else containerReadersOf.set(operand, [name]);
    }
  }
  return containerReadersOf;
}

function reach(stated: Iterable<string>, readersOf: (name: string) => readonly string[]): Set<string> {
  const reached = new Set<string>();
  const queue = [...stated];
  while (queue.length > 0) {
    for (const alias of readersOf(queue.pop() as string)) {
      if (reached.has(alias)) continue;
      reached.add(alias);
      queue.push(alias);
    }
  }
  return reached;
}

/**
 * Every name that reads a `stated` name through any chain of declarations the
 * document root holds: `enclosing` (the root's own rule, a vertical's compiled
 * channels) read by their text there, every other root alias by its root texts.
 * The channels a container scope must carry for its reads to re-resolve.
 */
export function containerReach(
  stated: Iterable<string>,
  enclosing: Readonly<Record<string, string>>
): Set<string> {
  const index = containerReaders();
  const enclosingReaders = new Map<string, string[]>();
  for (const [name, value] of Object.entries(enclosing)) {
    for (const operand of readsOf(value)) {
      const list = enclosingReaders.get(operand);
      if (list) list.push(name);
      else enclosingReaders.set(operand, [name]);
    }
  }
  const has = (name: string) => Object.prototype.hasOwnProperty.call(enclosing, name);
  return reach(stated, (name) => [
    ...(enclosingReaders.get(name) ?? []),
    ...(index.get(name) ?? []).filter((alias) => !has(alias)),
  ]);
}

/** What a container scope restates: base-rule declarations and the context rules after them. */
export interface ContainerRedeclarations {
  readonly declarations: Record<string, string>;
  readonly contexts: readonly ContainerAliasContext[];
}

/**
 * The container-scope law. A scope on an element below the document root
 * inherits every root alias already resolved at the root, so every alias that
 * reads a `stated` name, tabled or left out, directly or through another, is
 * restated: tabled ones with their root text in table order, left-out ones with
 * the cascade-winning root text, followed by the context rules a bare
 * restatement would override, in their ascending cascade order. A name in
 * `outright` keeps the value the scope or its root states and still carries the
 * re-resolution on. Root-element scopes never take this path.
 */
export function containerAliasRedeclarations(
  stated: Iterable<string>,
  outright: ReadonlySet<string>
): ContainerRedeclarations {
  const index = containerReaders();
  const reached = reach(stated, (name) => index.get(name) ?? []);
  const declarations: Record<string, string> = {};
  if (reached.size === 0) return { declarations, contexts: [] };
  const restated = (name: string) => reached.has(name) && !outright.has(name);
  for (const [name, value] of ROOT_ALIASES) if (restated(name)) declarations[name] = value;
  for (const alias of CONTAINER_ALIASES) if (restated(alias.name)) declarations[alias.name] = alias.value;
  return { declarations, contexts: CONTAINER_ALIAS_CONTEXTS.filter((context) => restated(context.name)) };
}
