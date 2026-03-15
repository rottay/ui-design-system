'use client';

/**
 * BhFantasyLeagueGame - Predict Preset
 * Active candidates list, prediction form with confidence slider,
 * pending predictions, points calculator, deadline countdown,
 * and recent resolved predictions.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Zap,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Edit3,
  Trash2,
  Send,
  Star,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { createPreset, type PresetContext } from '../../../factory';
import {
  createCardStyle,
  createBadgeStyle,
  createEmptyStateStyle,
  createPersonalitySkeletonStyle,
  createProgressBarStyle,
  createFilterPillStyle,
  createDividerStyle,
  getPersonalityTypography,
  clickableProps,
  ICON_SIZES,
  numericValue,
} from '../../../helpers';
import type {
  BhFantasyLeagueGameProps,
  FantasyCandidate,
  FantasyPredictionEntry,
} from '../../core';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PREDICTION_OPTIONS: Array<{
  value: FantasyPredictionEntry['prediction'];
  label: string;
  color: 'success' | 'error' | 'warning' | 'primary' | 'info';
  icon: typeof CheckCircle2;
}> = [
  { value: 'hire', label: 'Hire', color: 'success', icon: CheckCircle2 },
  { value: 'offer', label: 'Offer', color: 'primary', icon: Send },
  { value: 'advance', label: 'Advance', color: 'info', icon: ArrowUpRight },
  { value: 'pass', label: 'Pass', color: 'warning', icon: Minus },
  { value: 'reject', label: 'Reject', color: 'error', icon: XCircle },
];

const CONFIDENCE_LEVELS = [1, 2, 3, 4, 5];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const PredictBhFantasyLeagueGame = createPreset<BhFantasyLeagueGameProps>(
  'PredictBhFantasyLeagueGame',
  ({ primitives: { Box, Text, Button, Input }, props, tokens }: PresetContext<BhFantasyLeagueGameProps>) => {
    const {
      league,
      currentPlayer,
      candidates = [],
      predictions = [],
      loading = false,
      onMakePrediction,
      className,
      style,
    } = props;

    // State
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
    const [selectedPrediction, setSelectedPrediction] = useState<FantasyPredictionEntry['prediction'] | null>(null);
    const [confidence, setConfidence] = useState(1);

    const ptypo = useMemo(() => getPersonalityTypography(tokens), [tokens]);

    // Pending predictions (not resolved)
    const pendingPredictions = useMemo(
      () => predictions.filter((p) => !p.resolved),
      [predictions]
    );

    // Resolved predictions (most recent first)
    const resolvedPredictions = useMemo(
      () => predictions
        .filter((p) => p.resolved)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      [predictions]
    );

    // Selected candidate
    const selectedCandidate = useMemo(
      () => candidates.find((c) => c.id === selectedCandidateId),
      [candidates, selectedCandidateId]
    );

    // Points calculator
    const estimatedPoints = useMemo(() => {
      if (!selectedCandidate) return 0;
      const basePoints = 10;
      const oddsMultiplier = selectedCandidate.currentOdds;
      return Math.round(basePoints * confidence * oddsMultiplier);
    }, [selectedCandidate, confidence]);

    // Handle submit
    const handleSubmit = useCallback(() => {
      if (!onMakePrediction || !selectedCandidateId || !selectedPrediction) return;
      onMakePrediction(selectedCandidateId, selectedPrediction, confidence);
      setSelectedCandidateId(null);
      setSelectedPrediction(null);
      setConfidence(1);
    }, [onMakePrediction, selectedCandidateId, selectedPrediction, confidence]);

    // Color helpers
    const getPredictionColor = (pred: FantasyPredictionEntry['prediction']) => {
      const opt = PREDICTION_OPTIONS.find((o) => o.value === pred);
      return opt?.color ?? 'primary';
    };

    const getColorScale = (color: string) => {
      switch (color) {
        case 'success': return tokens.colors.successScale;
        case 'error': return tokens.colors.errorScale;
        case 'warning': return tokens.colors.warningScale;
        case 'info': return tokens.colors.infoScale;
        default: return tokens.colors.primaryScale;
      }
    };

    // Loading
    if (loading) {
      const skeletonStyle = createPersonalitySkeletonStyle(tokens);
      return (
        <Box style={{ padding: 24, ...style }} className={className}>
          <Box style={{ ...skeletonStyle, height: 32, width: 200, marginBottom: 24 }} />
          <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <Box key={i} style={{ ...skeletonStyle, height: 200 }} />
            ))}
          </Box>
        </Box>
      );
    }

    const cardStyle = createCardStyle(tokens, { elevation: 'sm', padding: 20 });

    return (
      <Box
        style={{
          padding: 24,
          minHeight: '100%',
          backgroundColor: tokens.colors.neutral[50],
          ...style,
        }}
        className={className}
      >
        {/* Header */}
        <Box style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Text style={{
              fontSize: numericValue(tokens.typography.fontSize.xl) + 4,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 4,
            }}>
              Make Predictions
            </Text>
            <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[500] }}>
              {league?.name ?? 'Fantasy League'} - Round {league?.currentRound ?? 1}/{league?.totalRounds ?? '?'}
            </Text>
          </Box>
          {currentPlayer && (
            <Box style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 16px',
              borderRadius: tokens.borderRadius.md,
              backgroundColor: tokens.colors.primaryScale[50],
              border: `1px solid ${tokens.colors.primaryScale[200]}`,
            }}>
              <Star size={16} style={{ color: tokens.colors.primaryScale[500] }} />
              <Text style={{ fontSize: tokens.typography.fontSize.md, fontWeight: tokens.typography.fontWeight.bold, color: tokens.colors.primaryScale[700] }}>
                {currentPlayer.totalPoints} pts
              </Text>
              <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                #{currentPlayer.rank}
              </Text>
            </Box>
          )}
        </Box>

        <Box style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* LEFT: Active Candidates */}
          <Box style={cardStyle}>
            <Text style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: 16,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Target size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
              Active Candidates ({candidates.length})
            </Text>

            <Box style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 500, overflowY: 'auto' }}>
              {candidates.length === 0 ? (
                <Box style={createEmptyStateStyle(tokens)}>
                  <Target size={32} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                    No active candidates
                  </Text>
                </Box>
              ) : (
                candidates.map((candidate) => {
                  const isSelected = selectedCandidateId === candidate.id;
                  const hasPrediction = pendingPredictions.some((p) => p.candidateId === candidate.id);
                  return (
                    <Box
                      key={candidate.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '12px 14px',
                        borderRadius: tokens.borderRadius.md,
                        backgroundColor: isSelected ? tokens.colors.primaryScale[50] : tokens.colors.common.white,
                        border: `2px solid ${isSelected ? tokens.colors.primaryScale[400] : tokens.colors.neutral[200]}`,
                        cursor: hasPrediction ? 'default' : 'pointer',
                        opacity: hasPrediction ? 0.6 : 1,
                        transition: 'all 0.15s ease',
                      }}
                      {...(!hasPrediction ? clickableProps(() => setSelectedCandidateId(isSelected ? null : candidate.id)) : {})}
                    >
                      <Box style={{
                        width: 40, height: 40, borderRadius: tokens.borderRadius.full,
                        backgroundColor: tokens.colors.primaryScale[100],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <User size={18} style={{ color: tokens.colors.primaryScale[500] }} />
                      </Box>
                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[800],
                        }}>
                          {candidate.name}
                        </Text>
                        <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                          {candidate.jobTitle} - {candidate.stage}
                        </Text>
                      </Box>
                      <Box style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                        <Text style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: tokens.colors.warningScale[600],
                        }}>
                          {candidate.currentOdds}x
                        </Text>
                        <Text style={{ fontSize: 10, color: tokens.colors.neutral[400] }}>odds</Text>
                      </Box>
                      {hasPrediction && (
                        <Box style={{
                          ...createBadgeStyle(tokens, 'secondary'),
                          fontSize: 10, padding: '2px 8px',
                        }}>
                          Predicted
                        </Box>
                      )}
                    </Box>
                  );
                })
              )}
            </Box>
          </Box>

          {/* RIGHT: Prediction Form + History */}
          <Box style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Prediction Form */}
            <Box style={cardStyle}>
              <Text style={{
                fontSize: tokens.typography.fontSize.xl,
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
                marginBottom: 16,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <Zap size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
                Prediction Form
              </Text>

              {selectedCandidate ? (
                <>
                  {/* Selected candidate */}
                  <Box style={{
                    padding: 12, borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.primaryScale[50],
                    border: `1px solid ${tokens.colors.primaryScale[200]}`,
                    marginBottom: 16,
                  }}>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.semibold,
                      color: tokens.colors.primaryScale[700],
                    }}>
                      {selectedCandidate.name}
                    </Text>
                    <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.neutral[500] }}>
                      {selectedCandidate.jobTitle} - Stage: {selectedCandidate.stage}
                      {selectedCandidate.interviewScore != null && ` - Score: ${selectedCandidate.interviewScore}`}
                    </Text>
                  </Box>

                  {/* Prediction options */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                    marginBottom: 8,
                  }}>
                    Choose outcome:
                  </Text>
                  <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                    {PREDICTION_OPTIONS.map((opt) => {
                      const scale = getColorScale(opt.color);
                      const isActive = selectedPrediction === opt.value;
                      return (
                        <Box
                          key={opt.value}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '8px 14px',
                            borderRadius: tokens.borderRadius.md,
                            backgroundColor: isActive ? scale[100] : tokens.colors.neutral[50],
                            border: `2px solid ${isActive ? scale[400] : tokens.colors.neutral[200]}`,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          {...clickableProps(() => setSelectedPrediction(opt.value))}
                        >
                          <opt.icon size={14} style={{ color: isActive ? scale[600] : tokens.colors.neutral[400] }} />
                          <Text style={{
                            fontSize: tokens.typography.fontSize.md,
                            fontWeight: isActive ? tokens.typography.fontWeight.semibold : tokens.typography.fontWeight.medium,
                            color: isActive ? scale[700] : tokens.colors.neutral[600],
                          }}>
                            {opt.label}
                          </Text>
                        </Box>
                      );
                    })}
                  </Box>

                  {/* Confidence slider */}
                  <Text style={{
                    fontSize: tokens.typography.fontSize.md,
                    fontWeight: tokens.typography.fontWeight.medium,
                    color: tokens.colors.neutral[700],
                    marginBottom: 8,
                  }}>
                    Confidence: {confidence}x multiplier
                  </Text>
                  <Box style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {CONFIDENCE_LEVELS.map((level) => (
                      <Box
                        key={level}
                        style={{
                          flex: 1,
                          padding: '10px 0',
                          textAlign: 'center' as const,
                          borderRadius: tokens.borderRadius.md,
                          backgroundColor: confidence >= level ? tokens.colors.warningScale[100] : tokens.colors.neutral[50],
                          border: `2px solid ${confidence >= level ? tokens.colors.warningScale[400] : tokens.colors.neutral[200]}`,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        {...clickableProps(() => setConfidence(level))}
                      >
                        <Text style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.bold,
                          color: confidence >= level ? tokens.colors.warningScale[700] : tokens.colors.neutral[400],
                        }}>
                          {level}x
                        </Text>
                      </Box>
                    ))}
                  </Box>

                  {/* Points preview */}
                  <Box style={{
                    padding: 12, borderRadius: tokens.borderRadius.md,
                    backgroundColor: tokens.colors.successScale[50],
                    border: `1px solid ${tokens.colors.successScale[200]}`,
                    marginBottom: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.successScale[700] }}>
                      Estimated points if correct:
                    </Text>
                    <Text style={{
                      fontSize: numericValue(tokens.typography.fontSize.xl) + 4,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: tokens.colors.successScale[600],
                    }}>
                      +{estimatedPoints}
                    </Text>
                  </Box>

                  {/* Submit */}
                  <Button
                    onClick={handleSubmit}
                    style={{
                      width: '100%',
                      backgroundColor: selectedPrediction ? tokens.colors.primaryScale[600] : tokens.colors.neutral[300],
                      color: tokens.colors.common.white,
                      padding: '12px 24px',
                      borderRadius: tokens.borderRadius.md,
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      cursor: selectedPrediction ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Send size={16} />
                    Submit Prediction
                  </Button>
                </>
              ) : (
                <Box style={{ ...createEmptyStateStyle(tokens), padding: 32 }}>
                  <HelpCircle size={32} style={{ color: tokens.colors.neutral[300], marginBottom: 8 }} />
                  <Text style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[400] }}>
                    Select a candidate to make a prediction
                  </Text>
                </Box>
              )}
            </Box>

            {/* Pending Predictions */}
            {pendingPredictions.length > 0 && (
              <Box style={cardStyle}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <Clock size={ICON_SIZES.section} style={{ color: tokens.colors.warningScale[500] }} />
                  Pending ({pendingPredictions.length})
                </Text>
                {pendingPredictions.map((pred) => {
                  const color = getPredictionColor(pred.prediction);
                  const scale = getColorScale(color);
                  return (
                    <Box key={pred.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px',
                      borderRadius: tokens.borderRadius.md,
                      backgroundColor: tokens.colors.neutral[50],
                      marginBottom: 6,
                    }}>
                      <Box style={{
                        ...createBadgeStyle(tokens, color as any),
                        fontSize: 10, padding: '2px 8px',
                      }}>
                        {pred.prediction}
                      </Box>
                      <Text style={{ flex: 1, fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[700] }}>
                        {pred.candidateName}
                      </Text>
                      <Text style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.warningScale[600], fontWeight: tokens.typography.fontWeight.semibold }}>
                        {pred.confidence}x
                      </Text>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Recent Resolved */}
            {resolvedPredictions.length > 0 && (
              <Box style={cardStyle}>
                <Text style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: 12,
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <BarChart3 size={ICON_SIZES.section} style={{ color: tokens.colors.primaryScale[500] }} />
                  Recent Results
                </Text>
                {resolvedPredictions.slice(0, 5).map((pred) => (
                  <Box key={pred.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 12px',
                    borderRadius: tokens.borderRadius.md,
                    backgroundColor: pred.correct ? tokens.colors.successScale[50] : tokens.colors.errorScale[50],
                    border: `1px solid ${pred.correct ? tokens.colors.successScale[200] : tokens.colors.errorScale[200]}`,
                    marginBottom: 6,
                  }}>
                    {pred.correct ? (
                      <CheckCircle2 size={16} style={{ color: tokens.colors.successScale[500] }} />
                    ) : (
                      <XCircle size={16} style={{ color: tokens.colors.errorScale[500] }} />
                    )}
                    <Text style={{ flex: 1, fontSize: tokens.typography.fontSize.md, color: tokens.colors.neutral[700] }}>
                      {pred.candidateName} - {pred.prediction}
                    </Text>
                    <Text style={{
                      fontSize: tokens.typography.fontSize.md,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: pred.pointsEarned > 0 ? tokens.colors.successScale[600] : tokens.colors.errorScale[600],
                    }}>
                      {pred.pointsEarned > 0 ? '+' : ''}{pred.pointsEarned}
                    </Text>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  }
);
