/**
 * Which BrandTheme field writes which channel — the WHOLE contract this time.
 *
 * The earlier map perturbed only `surfaces` and `chrome`, so "not writable"
 * could not be distinguished from "not probed". Every string leaf under every
 * top-level section is perturbed here, in both the base body and modes.dark,
 * because a channel reachable only in one tier is a different answer.
 */
import { writeFileSync } from 'node:fs';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Outputs land beside this file, so the harness is runnable from anywhere. */
const SP = dirname(fileURLToPath(import.meta.url));

const { renderArtifact } = await import(`${SP}/render-artifact.mjs`);
const CORE = resolve(SP, '../../../..');
const { execFileSync } = await import('node:child_process');
const { mkdtempSync, readFileSync } = await import('node:fs');
const { tmpdir } = await import('node:os');
const { join } = await import('node:path');
const { pathToFileURL } = await import('node:url');
function bundleTs(entry, tag){const out=join(mkdtempSync(join(tmpdir(),`m-${tag}-`)),'o.mjs');
  execFileSync(resolve(CORE,'node_modules/.bin/esbuild'),[resolve(CORE,entry),'--bundle','--format=esm','--platform=node',`--outfile=${out}`,'--log-level=error'],{stdio:['ignore','inherit','inherit']});
  return import(`${pathToFileURL(out).href}?t=${Date.now()}`)}
const R=await bundleTs('src/infrastructure/compilers/runtime/tenant-css/artifact-renderer/index.ts','r');
const T=await bundleTs('src/foundation/tokens/ts/presentation/brand-themes/bithire/index.ts','t');
const theme=T.bithireBrandTheme;
const spec=R.FIRST_PARTY_ARTIFACT_SPECS.find(s=>s.slug==='bithire');
const ext=readFileSync(resolve(CORE,'src/foundation/tokens/css/facade/artifacts/bithire/_source/extension.css'),'utf-8');
const render=bt=>R.renderFirstPartyArtifact({spec,brandTheme:bt,extensionCss:ext,regenerateCommand:R.FIRST_PARTY_ARTIFACT_REGENERATE_COMMAND}).css;
const decls=css=>{const m=new Map();for(const line of css.split('\n')){const x=/^\s*(--ds-[a-zA-Z0-9_-]+)\s*:\s*(.+?);?\s*$/.exec(line);if(x&&!m.has(x[1]))m.set(x[1],x[2]);}return m};
const base=decls(render(theme));
function leaves(node,prefix=[]){const out=[];for(const [k,v] of Object.entries(node??{})){
  if(v&&typeof v==='object'&&!Array.isArray(v))out.push(...leaves(v,[...prefix,k]));
  else if(typeof v==='string')out.push([...prefix,k]);}return out}
function withPath(o,p,v){const[h,...r]=p;return r.length?{...o,[h]:withPath(o[h]??{},r,v)}:{...o,[h]:v}}
const SECTIONS=['palette','typography','surfaces','motion','charts','chrome','expressive'];
const targets=SECTIONS.flatMap(s=>leaves(theme[s],[s]));
const channelToField={};const fieldToChannels={};
for(const path of targets){
  const S='#0102ff';
  const after=decls(render(withPath(theme,path,S)));
  const changed=[];
  for(const [n,v] of after) if(base.get(n)!==v && v.includes(S)) changed.push(n);
  const key=path.join('.');fieldToChannels[key]=changed;
  for(const n of changed)(channelToField[n]??=[]).push(key);
}
writeFileSync(`${SP}/fieldmap.json`,`${JSON.stringify({fieldToChannels,channelToField},null,1)}\n`);
console.log(`sections=${SECTIONS.length} fields probed=${targets.length} channels reachable=${Object.keys(channelToField).length} unmapped fields=${targets.filter(p=>!fieldToChannels[p.join('.')].length).length}`);
