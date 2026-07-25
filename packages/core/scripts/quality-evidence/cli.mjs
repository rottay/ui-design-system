#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  COMPONENT_EVIDENCE_MANIFEST,
  getComponentEvidenceContract,
} from './registry.mjs';
import { buildEvidenceMatrix } from './pairwise.mjs';
import {
  validateComponentEvidenceRegistry,
  validateQualityScorecard,
} from './schema.mjs';
import {
  createEmptyQualityScorecard,
  scoreQualityEvidence,
} from './scorer.mjs';

function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(path), 'utf8'));
}

function usage() {
  return {
    usage: [
      'node packages/core/scripts/quality-evidence/cli.mjs validate-manifest',
      'node packages/core/scripts/quality-evidence/cli.mjs manifest [DS-P032]',
      'node packages/core/scripts/quality-evidence/cli.mjs matrix DS-P032',
      'node packages/core/scripts/quality-evidence/cli.mjs empty-scorecard DS-P032',
      'node packages/core/scripts/quality-evidence/cli.mjs validate-scorecard path/to/scorecard.json',
      'node packages/core/scripts/quality-evidence/cli.mjs score path/to/scorecard.json',
    ],
    note: 'The CLI reads or prints JSON only. It never generates screenshots or approves craft.',
  };
}

function requireComponent(id) {
  const component = getComponentEvidenceContract(id);
  if (!component) throw new Error(`Unknown component id ${id ?? '<missing>'}`);
  return component;
}

const [command, argument] = process.argv.slice(2);

try {
  switch (command) {
    case 'validate-manifest': {
      const result = validateComponentEvidenceRegistry();
      print(result);
      if (!result.valid) process.exitCode = 1;
      break;
    }
    case 'manifest': {
      print(argument ? requireComponent(argument) : COMPONENT_EVIDENCE_MANIFEST);
      break;
    }
    case 'matrix': {
      print(buildEvidenceMatrix(requireComponent(argument)));
      break;
    }
    case 'empty-scorecard': {
      print(createEmptyQualityScorecard(requireComponent(argument).id));
      break;
    }
    case 'validate-scorecard': {
      const result = validateQualityScorecard(readJson(argument));
      print(result);
      if (!result.valid) process.exitCode = 1;
      break;
    }
    case 'score': {
      const result = scoreQualityEvidence(readJson(argument));
      print(result);
      if (!result.completionEligible) process.exitCode = 1;
      break;
    }
    default:
      print(usage());
      process.exitCode = command ? 1 : 0;
  }
} catch (error) {
  print({ valid: false, error: error instanceof Error ? error.message : String(error) });
  process.exitCode = 1;
}
