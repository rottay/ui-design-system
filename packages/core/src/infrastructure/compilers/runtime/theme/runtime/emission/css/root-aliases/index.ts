import { ROOT_ALIASES } from "./generated";

export { ROOT_ALIASES };

let readersOf: Map<string, string[]> | undefined;

/** operand -> the root aliases that read it, each alias listed once per operand. */
function readers(): Map<string, string[]> {
  if (readersOf) return readersOf;
  readersOf = new Map();
  for (const [name, value] of ROOT_ALIASES) {
    for (const operand of new Set([...value.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1] as string))) {
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
