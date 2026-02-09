'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle, createProgressBarStyle } from '../../../helpers';
import type { FeedbackCollectorProps } from '../../core';

// Mock data for standalone demo
const MOCK_SUMMARY = {
  nps: {
    questionId: 'q1',
    avgScore: 8.4,
    distribution: {
      promoters: 65, // 9-10
      passives: 25, // 7-8
      detractors: 10, // 0-6
    },
  },
  stars: {
    questionId: 'q2',
    avgScore: 4.3,
    distribution: {
      '5': 45,
      '4': 35,
      '3': 15,
      '2': 3,
      '1': 2,
    },
  },
  wordCloud: [
    { word: 'Amazing', count: 42 },
    { word: 'Great', count: 38 },
    { word: 'Awesome', count: 34 },
    { word: 'Fun', count: 31 },
    { word: 'Energy', count: 28 },
    { word: 'Music', count: 26 },
    { word: 'Atmosphere', count: 23 },
    { word: 'DJ', count: 21 },
    { word: 'Venue', count: 19 },
    { word: 'Experience', count: 18 },
    { word: 'Drinks', count: 16 },
    { word: 'Service', count: 14 },
    { word: 'Crowd', count: 12 },
    { word: 'Vibes', count: 11 },
    { word: 'Lighting', count: 9 },
  ],
  sentiment: {
    positive: 72,
    neutral: 21,
    negative: 7,
  },
  responseStats: {
    totalResponses: 248,
    completionRate: 84.3,
  },
  eventComparison: [
    { event: 'Winter Wonderland', npsScore: 8.4, responseCount: 248 },
    { event: 'New Year Celebration', npsScore: 8.1, responseCount: 312 },
    { event: 'Holiday Party', npsScore: 7.8, responseCount: 195 },
    { event: 'Fall Festival', npsScore: 7.5, responseCount: 221 },
  ],
};

export const FeedbackCollectorResults = createPreset<FeedbackCollectorProps>({
  name: 'FeedbackCollector.Results',
  render: (ctx: PresetContext<FeedbackCollectorProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const summary = MOCK_SUMMARY;

    const cardStyle = createCardStyle(tokens);

    const getNPSColor = (score: number) => {
      if (score >= 8) return tokens.colors.successScale;
      if (score >= 6) return tokens.colors.warningScale;
      return tokens.colors.errorScale;
    };

    const npsColor = getNPSColor(summary.nps.avgScore);
    const npsScore = Math.round(summary.nps.avgScore * 10);

    // Calculate font size based on word frequency
    const maxCount = Math.max(...summary.wordCloud.map((w) => w.count));
    const minCount = Math.min(...summary.wordCloud.map((w) => w.count));

    const getWordSize = (count: number) => {
      const minSize = 14;
      const maxSize = 48;
      const normalized = (count - minCount) / (maxCount - minCount);
      return minSize + normalized * (maxSize - minSize);
    };

    return (
      <Box style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Box
          style={{
            textAlign: 'center',
            marginBottom: tokens.spacing[6],
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize['3xl'],
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
            }}
          >
            Feedback Results
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[2],
            }}
          >
            {summary.responseStats.totalResponses} responses • {summary.responseStats.completionRate}
            % completion rate
          </Text>
        </Box>

        {/* Top Stats Row */}
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: tokens.spacing[3],
            marginBottom: tokens.spacing[6],
          }}
        >
          {/* NPS Score */}
          <Box style={{ ...cardStyle, textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[3],
              }}
            >
              Net Promoter Score
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: npsColor[600],
              }}
            >
              {npsScore}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              {summary.nps.avgScore.toFixed(1)} / 10.0
            </Text>
          </Box>

          {/* Star Rating */}
          <Box style={{ ...cardStyle, textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[3],
              }}
            >
              Average Rating
            </Text>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: tokens.spacing[1],
                marginBottom: tokens.spacing[2],
              }}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <Text
                  key={star}
                  style={{
                    fontSize: tokens.typography.fontSize['2xl'],
                    color:
                      star <= Math.round(summary.stars.avgScore)
                        ? tokens.colors.warningScale[500]
                        : tokens.colors.secondaryScale[300],
                  }}
                >
                  ★
                </Text>
              ))}
            </Box>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['2xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.neutral[900],
              }}
            >
              {summary.stars.avgScore.toFixed(1)}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              out of 5 stars
            </Text>
          </Box>

          {/* Sentiment Score */}
          <Box style={{ ...cardStyle, textAlign: 'center' }}>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[500],
                marginBottom: tokens.spacing[3],
              }}
            >
              Sentiment Score
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize['4xl'],
                fontWeight: tokens.typography.fontWeight.bold,
                color: tokens.colors.successScale[600],
              }}
            >
              {summary.sentiment.positive}%
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
                marginTop: tokens.spacing[1],
              }}
            >
              Positive feedback
            </Text>
          </Box>
        </Box>

        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: tokens.spacing[6],
          }}
        >
          {/* NPS Distribution */}
          <Box>
            <Box style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[4],
                }}
              >
                NPS Distribution
              </Text>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[4] }}>
                {/* Promoters */}
                <Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.successScale[500],
                        }}
                      />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        Promoters (9-10)
                      </Text>
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.successScale[600],
                      }}
                    >
                      {summary.nps.distribution.promoters}%
                    </Text>
                  </Box>
                  <Box
                    style={{
                      ...createProgressBarStyle(tokens, { color: tokens.colors.successScale[500], percent: summary.nps.distribution.promoters }).track,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${summary.nps.distribution.promoters}%`,
                        backgroundColor: tokens.colors.successScale[500],
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>

                {/* Passives */}
                <Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.warningScale[500],
                        }}
                      />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        Passives (7-8)
                      </Text>
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.warningScale[600],
                      }}
                    >
                      {summary.nps.distribution.passives}%
                    </Text>
                  </Box>
                  <Box
                    style={{
                      ...createProgressBarStyle(tokens, { color: tokens.colors.warningScale[500], percent: summary.nps.distribution.passives }).track,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${summary.nps.distribution.passives}%`,
                        backgroundColor: tokens.colors.warningScale[500],
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>

                {/* Detractors */}
                <Box>
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Box style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[2] }}>
                      <Box
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: tokens.borderRadius.full,
                          backgroundColor: tokens.colors.errorScale[500],
                        }}
                      />
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.medium,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        Detractors (0-6)
                      </Text>
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize.md,
                        fontWeight: tokens.typography.fontWeight.semibold,
                        color: tokens.colors.errorScale[600],
                      }}
                    >
                      {summary.nps.distribution.detractors}%
                    </Text>
                  </Box>
                  <Box
                    style={{
                      ...createProgressBarStyle(tokens, { color: tokens.colors.errorScale[500], percent: summary.nps.distribution.detractors }).track,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${summary.nps.distribution.detractors}%`,
                        backgroundColor: tokens.colors.errorScale[500],
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Star Rating Distribution */}
          <Box>
            <Box style={cardStyle}>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.xl,
                  fontWeight: tokens.typography.fontWeight.bold,
                  color: tokens.colors.neutral[900],
                  marginBottom: tokens.spacing[4],
                }}
              >
                Star Rating Distribution
              </Text>

              <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = summary.stars.distribution[star.toString() as keyof typeof summary.stars.distribution];
                  return (
                    <Box key={star}>
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: tokens.spacing[1],
                        }}
                      >
                        <Box
                          style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing[1] }}
                        >
                          {[...Array(star)].map((_, i) => (
                            <Text
                              key={i}
                              style={{
                                fontSize: tokens.typography.fontSize.md,
                                color: tokens.colors.warningScale[500],
                              }}
                            >
                              ★
                            </Text>
                          ))}
                        </Box>
                        <Text
                          style={{
                            fontSize: tokens.typography.fontSize.sm,
                            fontWeight: tokens.typography.fontWeight.medium,
                            color: tokens.colors.neutral[500],
                          }}
                        >
                          {count}%
                        </Text>
                      </Box>
                      <Box
                        style={{
                          height: '8px',
                          backgroundColor: tokens.colors.neutral[100],
                          borderRadius: tokens.borderRadius.full,
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          style={{
                            height: '100%',
                            width: `${count}%`,
                            backgroundColor: tokens.colors.warningScale[500],
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Word Cloud */}
        <Box style={{ ...cardStyle, marginTop: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Common Words in Feedback
          </Text>

          <Box
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: tokens.spacing[3],
              padding: tokens.spacing[6],
              minHeight: '200px',
            }}
          >
            {summary.wordCloud.map((item) => {
              const size = getWordSize(item.count);
              const colorIndex = Math.floor((item.count / maxCount) * 6);
              const colors = [
                tokens.colors.primaryScale[400],
                tokens.colors.primaryScale[500],
                tokens.colors.primaryScale[600],
                tokens.colors.infoScale[500],
                tokens.colors.successScale[500],
                tokens.colors.warningScale[500],
              ];

              return (
                <Box
                  key={item.word}
                  style={{
                    padding: tokens.spacing[1],
                  }}
                >
                  <Text
                    style={{
                      fontSize: `${size}px`,
                      fontWeight: tokens.typography.fontWeight.bold,
                      color: colors[colorIndex],
                      lineHeight: 1,
                    }}
                  >
                    {item.word}
                  </Text>
                </Box>
              );
            })}
          </Box>
        </Box>

        {/* Event Comparison */}
        <Box style={{ ...cardStyle, marginTop: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.bold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[4],
            }}
          >
            Event Comparison
          </Text>

          <Box style={{ display: 'flex', flexDirection: 'column', gap: tokens.spacing[3] }}>
            {summary.eventComparison.map((event, index) => {
              const isCurrentEvent = index === 0;
              return (
                <Box
                  key={event.event}
                  style={{
                    padding: tokens.spacing[3],
                    backgroundColor: isCurrentEvent
                      ? tokens.colors.primaryScale[50]
                      : tokens.colors.neutral[100],
                    borderRadius: tokens.borderRadius.md,
                    border: `1px solid ${
                      isCurrentEvent ? tokens.colors.primaryScale[200] : tokens.colors.neutral[200]
                    }`,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: tokens.spacing[2],
                    }}
                  >
                    <Box>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.md,
                          fontWeight: tokens.typography.fontWeight.semibold,
                          color: tokens.colors.neutral[900],
                        }}
                      >
                        {event.event}
                        {isCurrentEvent && (
                          <Text
                            as="span"
                            style={{
                              marginLeft: tokens.spacing[2],
                              fontSize: tokens.typography.fontSize.xs,
                              color: tokens.colors.primaryScale[600],
                              fontWeight: tokens.typography.fontWeight.medium,
                            }}
                          >
                            (Current)
                          </Text>
                        )}
                      </Text>
                      <Text
                        style={{
                          fontSize: tokens.typography.fontSize.sm,
                          color: tokens.colors.neutral[500],
                          marginTop: tokens.spacing[1],
                        }}
                      >
                        {event.responseCount} responses
                      </Text>
                    </Box>
                    <Text
                      style={{
                        fontSize: tokens.typography.fontSize['2xl'],
                        fontWeight: tokens.typography.fontWeight.bold,
                        color: getNPSColor(event.npsScore)[600],
                      }}
                    >
                      {event.npsScore.toFixed(1)}
                    </Text>
                  </Box>
                  <Box
                    style={{
                      height: '8px',
                      backgroundColor: tokens.colors.neutral[100],
                      borderRadius: tokens.borderRadius.full,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      style={{
                        height: '100%',
                        width: `${(event.npsScore / 10) * 100}%`,
                        backgroundColor: getNPSColor(event.npsScore)[500],
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  },
});
