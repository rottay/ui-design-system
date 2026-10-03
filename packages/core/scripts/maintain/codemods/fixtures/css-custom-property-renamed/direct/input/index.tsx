// var(--ds-commercial-hairline) in a comment is not a string.
export const rule = { borderColor: 'var(--ds-commercial-hairline)', color: 'var(--ds-commercial-fg, var(--ds-commercial-gray-1000))' };
export const pair = `1px solid var(--ds-commercial-hairline-strong)`;
export const inverse = 'var(--ds-text-inverse)';

export function Panel() {
  return <div style={{ background: 'var(--ds-commercial-paper)', transition: `opacity var(--ds-commercial-motion-fast)` }} />;
}
