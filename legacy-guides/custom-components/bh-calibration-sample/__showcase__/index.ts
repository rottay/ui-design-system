/**
 * bh-calibration-sample - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { CalibrationSample } from '../core';

export const MOCK_SAMPLE: CalibrationSample = {
  id: 'cal-1',
  scorableId: 'sc-1',
  candidateName: 'Sarah Johnson',
  dimensions: [
    { dimensionName: 'Technical Depth', humanScore: 4.2, aiScore: 3.8, deviation: -0.4, maxScore: 5, weight: 0.3, humanNotes: 'Strong understanding of system design principles', aiNotes: 'Demonstrated solid technical knowledge with some gaps in distributed systems', agreed: true },
    { dimensionName: 'Problem Solving', humanScore: 3.5, aiScore: 4.1, deviation: 0.6, maxScore: 5, weight: 0.25, humanNotes: 'Adequate problem decomposition, could improve on edge cases', aiNotes: 'Good structured approach to problem solving with clear methodology', agreed: false },
    { dimensionName: 'Communication', humanScore: 4.0, aiScore: 4.2, deviation: 0.2, maxScore: 5, weight: 0.2, humanNotes: 'Clear and articulate explanations', aiNotes: 'Well-structured responses with good use of examples', agreed: true },
    { dimensionName: 'Code Quality', humanScore: 3.0, aiScore: 4.5, deviation: 1.5, maxScore: 5, weight: 0.15, humanNotes: 'Some issues with naming conventions and error handling', aiNotes: 'Clean code with consistent patterns and good abstractions', agreed: false },
    { dimensionName: 'Culture Fit', humanScore: 4.5, aiScore: 4.3, deviation: -0.2, maxScore: 5, weight: 0.1, humanNotes: 'Excellent team player mentality, strong growth mindset', aiNotes: 'Positive collaborative indicators, aligns with company values', agreed: true },
  ],
  overallHumanScore: 3.8,
  overallAiScore: 4.1,
  overallDeviation: 0.3,
  agreementRate: 0.6,
  status: 'pending',
};
