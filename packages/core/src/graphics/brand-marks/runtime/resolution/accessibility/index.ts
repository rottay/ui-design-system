const warnedInputs = new Set<string>();

export function warnMarkOnce(key: string, message: string): void {
  if (process.env.NODE_ENV === 'production' || warnedInputs.has(key)) return;
  warnedInputs.add(key);
  console.warn(`[Rottay Mark] ${message}`);
}

export function resolveMarkAccessibility(
  key: string,
  label: unknown,
  decorative: unknown,
): { readonly label?: string } | null {
  const normalizedLabel = typeof label === 'string' ? label.trim() : '';
  const isLabeled = normalizedLabel.length > 0;
  const isDecorative = decorative === true;

  if (isLabeled === isDecorative) {
    warnMarkOnce(
      `a11y:${key}:${String(label)}:${String(decorative)}`,
      `Mark "${key}" must have either a non-empty label or decorative={true}; rendered null.`,
    );
    return null;
  }

  return isLabeled ? { label: normalizedLabel } : {};
}

