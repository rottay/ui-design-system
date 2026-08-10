/**
 * @fileoverview Shared CLI mechanics: argument parsing, findings, exit codes.
 *
 * ONE EXIT-CODE VOCABULARY across every check here, because a coordinator
 * wiring these into a batch script has to be able to tell a refusal from a
 * crash without reading the text:
 *
 *   0  the check ran and found nothing
 *   1  the check ran and FOUND something — a real violation
 *   2  the check could not run (bad arguments, missing file, unparseable plan)
 *
 * Conflating 1 and 2 is how a broken invocation gets read as a clean lane.
 */

export const EXIT = Object.freeze({ OK: 0, VIOLATION: 1, USAGE: 2 });

export function parseArgs(argv) {
  const flags = new Map();
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }
    const body = token.slice(2);
    const eq = body.indexOf('=');
    if (eq !== -1) {
      flags.set(body.slice(0, eq), body.slice(eq + 1));
      continue;
    }
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      flags.set(body, true);
      continue;
    }
    flags.set(body, next);
    i += 1;
  }
  return { flags, positional };
}

export function createFindings() {
  const findings = [];
  return {
    findings,
    add(finding) {
      findings.push(finding);
      return finding;
    },
    get count() {
      return findings.length;
    },
  };
}

const RULE = '─'.repeat(78);

export function heading(text) {
  console.log(`\n${text}\n${RULE}`);
}

export function line(text = '') {
  console.log(text);
}

export function fail(message) {
  console.error(`✗ ${message}`);
}

export function pass(message) {
  console.log(`✓ ${message}`);
}

/**
 * Print findings and return the exit code. `--json` prints the machine form
 * instead, so a wrapper never has to scrape the human text.
 */
export function conclude({ name, findings, json, summary }) {
  if (json) {
    console.log(JSON.stringify({ check: name, ok: findings.length === 0, summary, findings }, null, 2));
    return findings.length === 0 ? EXIT.OK : EXIT.VIOLATION;
  }
  if (findings.length === 0) {
    pass(`${name}: no violations. ${summary ?? ''}`.trimEnd());
    return EXIT.OK;
  }
  // Everything in the failure path goes to ONE stream. Splitting the message
  // across stdout and stderr let the details print above the finding they
  // belonged to whenever a caller combined the two.
  console.error(`\n${name}: ${findings.length} finding${findings.length === 1 ? '' : 's'}\n${RULE}`);
  for (const finding of findings) {
    console.error(`✗ [${finding.rule}] ${finding.message}`);
    for (const detail of finding.details ?? []) console.error(`    ${detail}`);
  }
  console.error(`\n✗ ${name}: FAILED with ${findings.length} finding${findings.length === 1 ? '' : 's'}. ${summary ?? ''}`.trimEnd());
  return EXIT.VIOLATION;
}
