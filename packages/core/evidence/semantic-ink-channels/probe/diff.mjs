import { readFileSync } from 'node:fs';
const before = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const after = JSON.parse(readFileSync(process.argv[3], 'utf8'));
let regressions = 0, repaired = 0, unchanged = 0;
for (const scope of Object.keys(before)) {
  console.log(`\n== ${scope} ==`);
  for (const [id, b] of Object.entries(before[scope].sites)) {
    const a = after[scope].sites[id];
    const flip = b.pass && !a.pass ? '  <<< PASS->FAIL' : (!b.pass && a.pass ? '  REPAIRED' : '');
    if (b.pass && !a.pass) regressions++;
    else if (!b.pass && a.pass) repaired++;
    if (b.ratio === a.ratio) unchanged++;
    console.log(`  ${id.padEnd(38)} ${String(b.ratio).padStart(5)} -> ${String(a.ratio).padStart(5)}  ink ${b.ink} -> ${a.ink}  ground ${a.ground}${flip}`);
  }
}
console.log(`\nregressions(pass->fail)=${regressions} repaired(fail->pass)=${repaired} byte-equal-ratio rows=${unchanged}`);
