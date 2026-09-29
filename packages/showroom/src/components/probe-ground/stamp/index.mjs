/**
 * The one root stamp: the governed root projection as a blocking first-in-body script.
 * Plain ESM so the Next build and a bare `node` (the first-paint assertion) load this same file.
 */

/**
 * `.dark` and `color-scheme` are the two surfaces the provider later claims; an absent or
 * `base` theme leaves `color-scheme` to the stylesheet.
 *
 * @param {import('@rottay/design-system/server').DocumentRootAttributes | Readonly<Record<string, string>>} attributes
 * @returns {string}
 */
export function buildRootStampScript(attributes) {
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
 * The same projection applied from a client commit: an inline script inserted by client
 * navigation never executes, so an in-place ground switch re-stamps the root through this.
 *
 * @param {Readonly<Record<string, string>>} attributes
 * @returns {void}
 */
export function applyRootStamp(attributes) {
  const root = document.documentElement;
  for (const key in attributes) root.setAttribute(key, attributes[key]);
  const theme = attributes['data-theme'];
  root.classList.toggle('dark', theme === 'dark');
  if (theme && theme !== 'base') root.style.colorScheme = theme;
}
