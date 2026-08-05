/**
 * The lab's own root-stamp serializer.
 *
 * Deliberately the lab's own ~10 lines rather than an import from
 * `components/torture-tenant`: R1 declares `/probe/ds-reference/**` the only
 * lab-owned glob, so an import from the torture harness would create a
 * consumption edge into a tree no R1 lane owns and would make the lab's
 * evidence depend on a file this round may not change.
 *
 * The behaviour is the DS's own governed root-attribute projection, applied
 * first-in-body so no paint can precede it.
 */

/** The attribute bag the DS's `resolveDocumentRootAttributes` produces. */
export type LabRootAttributes = Readonly<Record<string, string>>;

export function buildLabRootStampScript(attributes: LabRootAttributes): string {
  const payload = JSON.stringify(attributes);
  return (
    '(function(){try{' +
    'var r=document.documentElement,a=' +
    payload +
    ';' +
    'for(var k in a)r.setAttribute(k,a[k]);' +
    'var t=a["data-theme"];' +
    'r.classList.toggle("dark",t==="dark");' +
    'if(t&&t!=="base")r.style.colorScheme=t;' +
    '}catch(e){}})()'
  );
}

/**
 * Capture-time judging transforms.
 *
 * R1 requires proving three-second tenant recognition in grayscale and after
 * temporary primary-hue neutralization. Both are applied identically to both
 * grounds and are NEVER on by default — a judged capture and a normal capture
 * must be distinguishable in the receipt, so the mode travels in the URL.
 */
export type JudgeMode = 'none' | 'grayscale' | 'hue-neutral';

export function isJudgeMode(value: string | null | undefined): value is JudgeMode {
  return value === 'grayscale' || value === 'hue-neutral' || value === 'none';
}

/**
 * Grayscale is a filter on the whole document. Hue neutralization is NOT a
 * filter: it rewrites the tenant's primary family to a neutral of the same
 * lightness, so everything that is not hue — geometry, weight, rhythm, rule,
 * depth — has to carry recognition on its own. That is the harder test and the
 * one the round actually asks for.
 */
export function judgeModeStyle(mode: JudgeMode): string {
  if (mode === 'grayscale') {
    return ':root{filter:grayscale(1) !important;}';
  }
  if (mode === 'hue-neutral') {
    return [
      ':root{',
      '--ds-color-primary:#6E6E6E !important;',
      '--ds-color-primary-hover:#5C5C5C !important;',
      '--ds-color-primary-active:#4A4A4A !important;',
      '--ds-color-secondary:#7A7A7A !important;',
      '--ds-color-accent:#666666 !important;',
      '}',
    ].join('');
  }
  return '';
}
