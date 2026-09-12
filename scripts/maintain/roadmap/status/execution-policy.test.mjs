import assert from "node:assert/strict";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { executionPolicyText } from "./index.mjs";

const root = fileURLToPath(new URL("../../../../", import.meta.url));
const readme = fs.readFileSync(new URL("../../../../roadmap/README.md", import.meta.url), "utf8");

test("execution policy is sourced from README and excludes surrounding history", () => {
  assert.equal(executionPolicyText("old\n<!-- execution-policy:start -->\npolicy\n<!-- execution-policy:end -->\nold"), "policy");
  const policy = executionPolicyText(readme);
  for (const phrase of ["independent code auditor", "Codex, Fable and Kimi", "focal tests", "important milestones", "WO-FAM-01", "never push"]) {
    assert.ok(policy.includes(phrase), phrase);
  }
});

test("execution policy cannot disappear, duplicate or become empty silently", () => {
  for (const text of ["", readme + readme, "<!-- execution-policy:start --><!-- execution-policy:end -->", "<!-- execution-policy:start -->body"]) {
    assert.throws(() => executionPolicyText(text), /execution policy/);
  }
});

test("delegate prints the current policy for core and family WOs without changing state", () => {
  const registryPath = new URL("../../../../roadmap/registry.json", import.meta.url);
  const before = fs.readFileSync(registryPath, "utf8");
  const script = fileURLToPath(new URL("./index.mjs", import.meta.url));
  for (const id of ["WO-EMI-02", "WO-FAM-01"]) {
    const output = execFileSync(process.execPath, [script, "delegate", id], { cwd: root, encoding: "utf8" });
    assert.ok(output.includes(executionPolicyText(readme)), id);
    assert.ok(output.includes("[state]"), id);
    assert.ok(!output.includes("commit only when full cert is green"), id);
  }
  assert.equal(fs.readFileSync(registryPath, "utf8"), before);
});
