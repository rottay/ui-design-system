export function Button({ children }: { children: unknown }) {
  return <button type="button">{String(children)}</button>;
}
