/**
 * @fileoverview The drill harness.
 *
 * A CHECK NEVER SEEN TO FAIL PROVES NOTHING. That is a standing law here, and
 * it is why every checker in this folder ships drills rather than tests of its
 * happy path. Each drill injects a specific violation and asserts that the
 * check REFUSES it — by exit code and by rule id, so a check that fails for
 * an unrelated reason does not count as a pass.
 *
 * Every drill also carries a POSITIVE CONTROL. A checker rigged to fail
 * always would satisfy every negative drill in this file; the control is what
 * separates a working check from a broken one.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function withTempDir(prefix, body) {
  const dir = mkdtempSync(join(tmpdir(), `lane-control-${prefix}-`));
  try {
    return body(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: 'utf8', ...options });
  return {
    status: result.status,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    output: `${result.stdout ?? ''}${result.stderr ?? ''}`,
  };
}

/**
 * Run a check IN PROCESS and shape the outcome like `run()`.
 *
 * A drill that needs a mutated catalog — a family repointed at another
 * family's subtree, a source owner that does not exist — used to get one by
 * passing `--inventory <fixture>` to the public command. That made the drill's
 * own convenience a production bypass: anyone could bind any lane to any
 * subtree from the command line, and the file was asked to vouch for itself
 * with a `"noncanonical": true` field written by the same hand as the lane it
 * waved through. The commands now refuse the flag outright, and fixtures are
 * injected here, through the module API, where the caller is a drill and not a
 * user. Exit semantics are the commands' own: 0 clean, 1 findings, 2 could not
 * run.
 */
export function inProcess(body) {
  try {
    const findings = body() ?? [];
    const output = findings
      .map((finding) => [`${finding.rule}: ${finding.message}`, ...(finding.details ?? []).map((line) => `    ${line}`)].join('\n'))
      .join('\n');
    return { status: findings.length > 0 ? 1 : 0, stdout: output, stderr: '', output };
  } catch (error) {
    const output = String(error?.message ?? error);
    return { status: 2, stdout: '', stderr: output, output };
  }
}

export function createDrillSuite(name) {
  const results = [];

  const record = (entry) => {
    results.push(entry);
    const mark = entry.ok ? '✓' : '✗';
    console.log(`  ${mark} ${entry.label}`);
    for (const detail of entry.details ?? []) console.log(`      ${detail}`);
    return entry;
  };

  return {
    name,
    results,

    /** The check must REFUSE: non-zero exit, and the named rule must appear. */
    expectRefusal({ label, result, rule, exitCode = 1, showOutput = false }) {
      const statusOk = result.status === exitCode;
      const ruleOk = rule ? result.output.includes(rule) : true;
      const details = [`exit=${result.status} (expected ${exitCode})`];
      if (rule) details.push(`rule "${rule}" ${ruleOk ? 'present' : 'ABSENT'}`);
      if (showOutput || !(statusOk && ruleOk)) {
        details.push('--- checker output ---');
        for (const line of result.output.trimEnd().split('\n')) details.push(line);
      }
      return record({ label, ok: statusOk && ruleOk, details });
    },

    /** The positive control: the same check must PASS on clean input. */
    expectPass({ label, result }) {
      const ok = result.status === 0;
      const details = [`exit=${result.status} (expected 0)`];
      if (!ok) {
        details.push('--- checker output ---');
        for (const line of result.output.trimEnd().split('\n')) details.push(line);
      }
      return record({ label, ok, details });
    },

    /** An assertion about the drill's own setup, not about the checker. */
    expectFact({ label, ok, details }) {
      return record({ label, ok, details });
    },

    summary() {
      const failed = results.filter((entry) => !entry.ok);
      console.log(
        `\n${failed.length === 0 ? '✓' : '✗'} ${name}: ${results.length - failed.length}/${results.length} drills behaved as specified`,
      );
      return failed.length === 0;
    },
  };
}
