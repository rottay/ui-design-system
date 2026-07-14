/**
 * Reverse-presence half of a per-file ratchet. The usual current->baseline
 * comparison cannot observe a key that vanished with its file, subtree, or
 * collector, so every baseline key in the namespace must still be emitted.
 */
export function collectMissingPrefixedCounters(
  counters,
  baseline,
  prefix
) {
  return Object.keys(baseline).filter(
    (key) => key.startsWith(prefix) && !(key in counters)
  );
}
