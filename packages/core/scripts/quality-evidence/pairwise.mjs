/**
 * Deterministic constrained-pairwise evidence matrix.
 *
 * States and content profiles are rendered together inside each gallery cell.
 * Axes are pairwise-covered only within the registry's disjoint groups. This
 * avoids the infeasible full Cartesian product while still proving the risky
 * relationships explicitly selected by the component contract.
 */

function pairKey(axisA, valueA, axisB, valueB) {
  return axisA < axisB
    ? `${axisA}=${valueA}|${axisB}=${valueB}`
    : `${axisB}=${valueB}|${axisA}=${valueA}`;
}

function requiredPairs(axes, group) {
  const pairs = new Set();
  for (let left = 0; left < group.length; left += 1) {
    for (let right = left + 1; right < group.length; right += 1) {
      const axisA = group[left];
      const axisB = group[right];
      for (const valueA of axes[axisA]) {
        for (const valueB of axes[axisB]) pairs.add(pairKey(axisA, valueA, axisB, valueB));
      }
    }
  }
  return pairs;
}

function coveredPairs(row, group) {
  const pairs = new Set();
  for (let left = 0; left < group.length; left += 1) {
    for (let right = left + 1; right < group.length; right += 1) {
      const axisA = group[left];
      const axisB = group[right];
      pairs.add(pairKey(axisA, row[axisA], axisB, row[axisB]));
    }
  }
  return pairs;
}

function chooseValue(axis, values, row, assignedAxes, uncovered, ordinal) {
  let best = values[ordinal % values.length];
  let bestScore = -1;
  for (const value of values) {
    const score = assignedAxes.reduce(
      (total, otherAxis) => total + Number(uncovered.has(pairKey(axis, value, otherAxis, row[otherAxis]))),
      0,
    );
    if (score > bestScore) {
      best = value;
      bestScore = score;
    }
  }
  return best;
}

function buildGroupMatrix(axes, rawGroup) {
  const group = [...rawGroup].sort((left, right) => axes[right].length - axes[left].length || left.localeCompare(right));
  if (group.length === 1) return axes[group[0]].map((value) => ({ [group[0]]: value }));

  const required = requiredPairs(axes, group);
  const uncovered = new Set(required);
  const [first, second, ...remaining] = group;
  const rows = [];

  for (const firstValue of axes[first]) {
    for (const secondValue of axes[second]) {
      rows.push({ [first]: firstValue, [second]: secondValue });
    }
  }

  const assignedAxes = [first, second];
  for (const axis of remaining) {
    rows.forEach((row, index) => {
      row[axis] = chooseValue(axis, axes[axis], row, assignedAxes, uncovered, index);
      for (const covered of coveredPairs(row, [...assignedAxes, axis])) uncovered.delete(covered);
    });
    assignedAxes.push(axis);
  }

  for (const row of rows) {
    for (const covered of coveredPairs(row, group)) uncovered.delete(covered);
  }

  // The greedy extension normally closes every pair for the small Wave 0
  // groups. Any residual pair receives a deterministic repair row instead of
  // silently weakening coverage.
  for (const missing of [...uncovered]) {
    if (!uncovered.has(missing)) continue;
    const assignments = Object.fromEntries(
      missing.split('|').map((part) => {
        const separator = part.indexOf('=');
        return [part.slice(0, separator), part.slice(separator + 1)];
      }),
    );
    const row = {};
    for (const axis of group) row[axis] = assignments[axis] ?? axes[axis][rows.length % axes[axis].length];
    rows.push(row);
    for (const covered of coveredPairs(row, group)) uncovered.delete(covered);
  }

  return rows;
}

export function analyzePairwiseCoverage(component, cells) {
  const missing = [];
  for (const group of component.pairwiseGroups) {
    const required = requiredPairs(component.axes, group);
    for (const cell of cells) {
      for (const covered of coveredPairs(cell.axes, group)) required.delete(covered);
    }
    missing.push(...required);
  }
  return {
    complete: missing.length === 0,
    missing,
    cellCount: cells.length,
    budget: component.matrixBudget,
    withinBudget: cells.length <= component.matrixBudget,
  };
}

export function buildEvidenceMatrix(component, { enforceBudget = true } = {}) {
  const groupMatrices = component.pairwiseGroups.map((group) => buildGroupMatrix(component.axes, group));
  const cellCount = Math.max(...groupMatrices.map((matrix) => matrix.length));
  const cells = Array.from({ length: cellCount }, (_, index) => {
    const axes = Object.assign(
      {},
      ...groupMatrices.map((matrix) => matrix[index % matrix.length]),
    );
    return Object.freeze({
      id: `${component.id}-E${String(index + 1).padStart(2, '0')}`,
      axes: Object.freeze(axes),
      renderedStates: component.renderedStates,
      renderedContentProfiles: component.renderedContentProfiles,
    });
  });

  const coverage = analyzePairwiseCoverage(component, cells);
  if (!coverage.complete) {
    throw new Error(`${component.id} evidence matrix is missing pair coverage: ${coverage.missing.join(', ')}`);
  }
  if (enforceBudget && !coverage.withinBudget) {
    throw new Error(
      `${component.id} evidence matrix requires ${coverage.cellCount} cells, exceeding budget ${coverage.budget}`,
    );
  }

  return Object.freeze({
    schemaVersion: 1,
    componentId: component.id,
    strategy: 'constrained-pairwise-v1',
    note: 'States and content profiles render inside every cell; only axes within each declared group are pairwise.',
    groups: component.pairwiseGroups,
    coverage: Object.freeze(coverage),
    cells: Object.freeze(cells),
  });
}
