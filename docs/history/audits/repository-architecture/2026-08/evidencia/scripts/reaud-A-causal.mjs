import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const m = require('./reaud-A-tm.cjs');
const ID = { tenantId:'t', slug:'probe', verticalKey:'bithire', rowVersion:1 };
const ENV = m.TENANT_THEME_VERTICAL_ENVELOPES.bithire;

function compile(appearance){
  return m.compileTenantThemeConfig({...ID, schemaVersion:1, mode:'simple', appearance}, {verticalEnvelope:ENV});
}
// identity: empty appearance
const base = compile({});
const baseVars = base.variables;
console.log('identity overlay size (must be 0 for exact restore):', Object.keys(baseVars).length, '| modeDeltas', (base.modeDeltas||[]).length);
console.log();

const CASES = [
  ['palette.seeds',            {palette:{primary:'#B22222'}}],
  ['typography.pairing',       {typography:{typePairing:'editorial'}}],
  ['typography.families',      {typography:{fontFamilyBase:"'Probe A', sans-serif", fontFamilyHeading:"'Probe B', serif"}}],
  ['typography.scale',         {typography:{scale:1.08}}],
  ['shape.radius-scale',       {shape:{radiusScale:1.2}}],
  ['shape.button-style',       {shape:{buttonStyle:'pill'}}],
  ['density.mode',             {density:'spacious'}],
  ['spacing.rhythm',           {rhythm:'airy'}],
  ['motion.dial',              {motion:{intensity:0.8,durationScale:1.35}}],
  ['surfaces.elevation',       {surfaces:{elevation:'flat'}}],
  ['surfaces.effect-intensity',{surfaces:{effectIntensity:0}}],
  ['navigation.sidebar-tone',  {navigation:{sidebarTone:'inverse'}}],
  ['experience.profile',       {experienceProfile:'rottay/management-editorial@1'}],
];
const rows=[];
for(const [name, app] of CASES){
  let out;
  try{ out = compile(app); }catch(e){ rows.push([name,'ERROR: '+e.message,0,0]); continue; }
  const keys = Object.keys(out.variables);
  const md = (out.modeDeltas||[]).reduce((s,b)=>s+Object.keys(b.variables).length,0);
  rows.push([name, '', keys.length, md, keys]);
}
console.log('CONTROL'.padEnd(28), 'Δvars', 'Δmode');
for(const r of rows) console.log(String(r[0]).padEnd(28), String(r[2]).padStart(5), String(r[3]).padStart(5), r[1]);
import('node:fs').then(fs=>fs.writeFileSync('reaud-A-causal.json', JSON.stringify(Object.fromEntries(rows.map(r=>[r[0],r[4]||[]])),null,1)));
