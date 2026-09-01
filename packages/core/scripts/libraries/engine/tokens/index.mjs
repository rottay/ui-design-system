/** Shared governance classes for engine-token-audit and its semantic evidence. */
export const ENGINE_TOKEN_EXACT = Object.freeze({
  'depth.shadowScales': 1,
  'layout.crossEngineDivergences': 0,
  'scale.radiusScaleDeclarations': 1,
  'state.darkFocusRingDefects': 0,
  'themeCss.unreferencedSelectors': 0,
  'skins.parseErrors': 0,
  'skins.unwired': 0,
  'skins.exemptionsBreached': 0,
  'skins.deadParts': 0,
  'embeddedCssPaint.unclassified': 0,
  'embeddedCssPaint.parseFailures': 0,
  'embeddedCssPaint.dynamicProperties': 0,
  'embeddedCssPaint.unknownSinks': 0,
});

export const ENGINE_TOKEN_MINIMUM = Object.freeze({
  'effects.gradientConsumers': 1,
  'effects.glassConsumers': 1,
  'effects.glowConsumers': 1,
  // WO-CRA-15: the motion recipe canon must keep at least three distinct
  // component consumers (audit MOT-02 found the tuned recipes fully dead).
  'motion.recipeConsumers': 3,
  // Recalibrated after the reviewed 2026-07-17 source-tree consolidation:
  // six compatibility leaves were folded into canonical folder/index homes.
  // The structure gate independently prevents authored leaves from escaping
  // the scanner, so this remains a fail-closed coverage floor.
  'fleet.inlinePaint.filesScanned': 778,
  'runtimeSvgPaint.filesScanned': 1062,
  'embeddedCssPaint.filesScanned': 1062,
});
