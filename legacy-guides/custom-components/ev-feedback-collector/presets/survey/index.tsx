'use client';

import { createPreset, type PresetContext } from '../../../factory';
import { createCardStyle } from '../../../helpers';
import type { FeedbackCollectorProps } from '../../core';
import { useState } from 'react';

// Mock data for standalone demo
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    type: 'nps' as const,
    question: 'How likely are you to recommend this event to a friend or colleague?',
  },
  {
    id: 'q2',
    type: 'stars' as const,
    question: 'How would you rate the overall event experience?',
  },
  {
    id: 'q3',
    type: 'emoji' as const,
    question: 'How did you feel about the music selection?',
  },
  {
    id: 'q4',
    type: 'multiple-choice' as const,
    question: 'What aspect of the event did you enjoy most?',
    options: ['Music & DJ', 'Venue & Atmosphere', 'Food & Drinks', 'Social Experience', 'Other'],
  },
  {
    id: 'q5',
    type: 'text' as const,
    question: 'What could we improve for future events?',
  },
];

export const FeedbackCollectorSurvey = createPreset<FeedbackCollectorProps>({
  name: 'FeedbackCollector.Survey',
  render: (ctx: PresetContext<FeedbackCollectorProps>) => {
    const { primitives, props, tokens, engine } = ctx;
    const { Box, Text } = primitives;

    const questions = props.questions || MOCK_QUESTIONS;
    const [responses, setResponses] = useState<Record<string, string | number>>({});
    const [currentQuestion, setCurrentQuestion] = useState(0);

    const handleResponse = (questionId: string, value: string | number) => {
      setResponses((prev) => ({ ...prev, [questionId]: value }));
    };

    const cardStyle = createCardStyle(tokens);
    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const question = questions[currentQuestion];

    const renderNPS = (questionId: string) => {
      return (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(11, 1fr)',
            gap: tokens.spacing[1],
          }}
        >
          {[...Array(11)].map((_, i) => {
            const isSelected = responses[questionId] === i;
            const getColor = () => {
              if (i <= 6) return tokens.colors.errorScale;
              if (i <= 8) return tokens.colors.warningScale;
              return tokens.colors.successScale;
            };
            const colorScale = getColor();

            return (
              <button
                key={i}
                onClick={() => handleResponse(questionId, i)}
                style={{
                  aspectRatio: '1',
                  border: `2px solid ${isSelected ? colorScale[600] : tokens.colors.neutral[200]}`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: isSelected ? colorScale[100] : tokens.colors.neutral[50],
                  color: isSelected ? colorScale[700] : tokens.colors.neutral[900],
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.semibold,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {i}
              </button>
            );
          })}
        </Box>
      );
    };

    const renderStars = (questionId: string) => {
      return (
        <Box
          style={{
            display: 'flex',
            gap: tokens.spacing[2],
            justifyContent: 'center',
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => {
            const isSelected = (responses[questionId] as number) >= star;
            return (
              <button
                key={star}
                onClick={() => handleResponse(questionId, star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: tokens.typography.fontSize['4xl'],
                  color: isSelected
                    ? tokens.colors.warningScale[500]
                    : tokens.colors.secondaryScale[300],
                  transition: 'color 0.2s ease',
                }}
              >
                {isSelected ? '★' : '☆'}
              </button>
            );
          })}
        </Box>
      );
    };

    const renderEmoji = (questionId: string) => {
      const emojis = [
        { value: 1, emoji: '😞', label: 'Poor' },
        { value: 2, emoji: '😕', label: 'Fair' },
        { value: 3, emoji: '😐', label: 'Okay' },
        { value: 4, emoji: '😊', label: 'Good' },
        { value: 5, emoji: '😍', label: 'Excellent' },
      ];

      return (
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: tokens.spacing[3],
          }}
        >
          {emojis.map((item) => {
            const isSelected = responses[questionId] === item.value;
            return (
              <button
                key={item.value}
                onClick={() => handleResponse(questionId, item.value)}
                style={{
                  padding: tokens.spacing[3],
                  border: `2px solid ${
                    isSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200]
                  }`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: isSelected
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.neutral[50],
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: tokens.spacing[1],
                  transition: 'all 0.2s ease',
                }}
              >
                <Box style={{ fontSize: tokens.typography.fontSize['3xl'] }}>{item.emoji}</Box>
                <Text
                  style={{
                    fontSize: tokens.typography.fontSize.sm,
                    color: isSelected
                      ? tokens.colors.primaryScale[700]
                      : tokens.colors.neutral[500],
                    fontWeight: tokens.typography.fontWeight.medium,
                  }}
                >
                  {item.label}
                </Text>
              </button>
            );
          })}
        </Box>
      );
    };

    const renderMultipleChoice = (questionId: string, options: string[]) => {
      return (
        <Box
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing[2],
          }}
        >
          {options.map((option) => {
            const isSelected = responses[questionId] === option;
            return (
              <button
                key={option}
                onClick={() => handleResponse(questionId, option)}
                style={{
                  padding: tokens.spacing[3],
                  border: `2px solid ${
                    isSelected ? tokens.colors.primaryScale[600] : tokens.colors.neutral[200]
                  }`,
                  borderRadius: tokens.borderRadius.md,
                  backgroundColor: isSelected
                    ? tokens.colors.primaryScale[50]
                    : tokens.colors.neutral[50],
                  color: isSelected
                    ? tokens.colors.primaryScale[700]
                    : tokens.colors.neutral[900],
                  fontSize: tokens.typography.fontSize.md,
                  fontWeight: tokens.typography.fontWeight.medium,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                }}
              >
                {option}
              </button>
            );
          })}
        </Box>
      );
    };

    const renderText = (questionId: string) => {
      return (
        <textarea
          value={(responses[questionId] as string) || ''}
          onChange={(e) => handleResponse(questionId, e.target.value)}
          placeholder="Type your feedback here..."
          rows={6}
          style={{
            width: '100%',
            padding: tokens.spacing[3],
            border: `1px solid ${tokens.colors.neutral[200]}`,
            borderRadius: tokens.borderRadius.md,
            fontSize: tokens.typography.fontSize.md,
            fontFamily: 'inherit',
            resize: 'vertical',
            outline: 'none',
          }}
        />
      );
    };

    return (
      <Box style={{ maxWidth: '800px', margin: '0 auto' }}>
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
            Event Feedback Survey
          </Text>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.md,
              color: tokens.colors.neutral[500],
              marginTop: tokens.spacing[2],
            }}
          >
            Help us improve your experience
          </Text>
        </Box>

        {/* Progress Bar */}
        <Box
          style={{
            marginBottom: tokens.spacing[6],
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
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                fontWeight: tokens.typography.fontWeight.medium,
                color: tokens.colors.neutral[900],
              }}
            >
              Question {currentQuestion + 1} of {questions.length}
            </Text>
            <Text
              style={{
                fontSize: tokens.typography.fontSize.sm,
                color: tokens.colors.neutral[500],
              }}
            >
              {Math.round(progress)}% Complete
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
                width: `${progress}%`,
                backgroundColor: tokens.colors.primaryScale[600],
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>

        {/* Question Card */}
        <Box style={{ ...cardStyle, marginBottom: tokens.spacing[6] }}>
          <Text
            style={{
              fontSize: tokens.typography.fontSize.xl,
              fontWeight: tokens.typography.fontWeight.semibold,
              color: tokens.colors.neutral[900],
              marginBottom: tokens.spacing[6],
              lineHeight: 1.5,
            }}
          >
            {question.question}
          </Text>

          {question.type === 'nps' && renderNPS(question.id)}
          {question.type === 'stars' && renderStars(question.id)}
          {question.type === 'emoji' && renderEmoji(question.id)}
          {question.type === 'multiple-choice' &&
            question.options &&
            renderMultipleChoice(question.id, question.options)}
          {question.type === 'text' && renderText(question.id)}

          {/* Helper Text */}
          {question.type === 'nps' && (
            <Box
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: tokens.spacing[3],
              }}
            >
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                Not at all likely
              </Text>
              <Text
                style={{
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.neutral[500],
                }}
              >
                Extremely likely
              </Text>
            </Box>
          )}
        </Box>

        {/* Navigation Buttons */}
        <Box
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: tokens.spacing[3],
          }}
        >
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            style={{
              padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
              backgroundColor: tokens.colors.neutral[100],
              color: tokens.colors.neutral[900],
              border: `1px solid ${tokens.colors.neutral[200]}`,
              borderRadius: tokens.borderRadius.md,
              fontSize: tokens.typography.fontSize.md,
              fontWeight: tokens.typography.fontWeight.medium,
              cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
              opacity: currentQuestion === 0 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestion(currentQuestion + 1)}
              disabled={responses[question.id] === undefined}
              style={{
                padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                backgroundColor:
                  responses[question.id] !== undefined
                    ? tokens.colors.primaryScale[600]
                    : tokens.colors.neutral[100],
                color:
                  responses[question.id] !== undefined
                    ? tokens.colors.common.white
                    : tokens.colors.neutral[500],
                border:
                  responses[question.id] !== undefined
                    ? 'none'
                    : `1px solid ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: responses[question.id] !== undefined ? 'pointer' : 'not-allowed',
              }}
            >
              Next
            </button>
          ) : (
            <button
              disabled={responses[question.id] === undefined}
              style={{
                padding: `${tokens.spacing[3]} ${tokens.spacing[6]}`,
                backgroundColor:
                  responses[question.id] !== undefined
                    ? tokens.colors.successScale[600]
                    : tokens.colors.neutral[100],
                color:
                  responses[question.id] !== undefined
                    ? tokens.colors.common.white
                    : tokens.colors.neutral[500],
                border:
                  responses[question.id] !== undefined
                    ? 'none'
                    : `1px solid ${tokens.colors.neutral[200]}`,
                borderRadius: tokens.borderRadius.md,
                fontSize: tokens.typography.fontSize.md,
                fontWeight: tokens.typography.fontWeight.medium,
                cursor: responses[question.id] !== undefined ? 'pointer' : 'not-allowed',
              }}
            >
              Submit Survey
            </button>
          )}
        </Box>

        {/* Response Summary */}
        <Box
          style={{
            ...cardStyle,
            marginTop: tokens.spacing[6],
            backgroundColor: tokens.colors.infoScale[50],
            border: `1px solid ${tokens.colors.infoScale[200]}`,
          }}
        >
          <Text
            style={{
              fontSize: tokens.typography.fontSize.sm,
              fontWeight: tokens.typography.fontWeight.medium,
              color: tokens.colors.infoScale[700],
            }}
          >
            {Object.keys(responses).length} of {questions.length} questions answered
          </Text>
        </Box>
      </Box>
    );
  },
});
