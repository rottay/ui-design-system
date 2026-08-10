'use client';

/* Commercial framing fixtures, lane A: AsciiFrame, CropMarks, InvertSection,
   SectionFrame, and TextureBackdrop — the five framing families of the kit. */

import type { ReactNode } from 'react';
import { Box, Flex, Stack, Text } from '@rottay/design-system';
import {
  AsciiFrame,
  CropMarks,
  InvertSection,
  SectionFrame,
  TextureBackdrop,
} from '@rottay/design-system/commercial';

export function ConfigCommercialASurface({ only }: { only: string }): ReactNode {
  switch (only) {
    case 'ascii-frame':
      return (
        <InvertSection surface="ink">
          {/* The seated label rides ON the top rule (translated up by half its own
              height), so it paints ABOVE the frame's box. A consumer must leave
              that room: flush against the section edge, the label's upper half is
              cut off. Same class as the CropMarks tick hazard below. */}
          <Box padding="lg">
          <Flex gap="xl" wrap="wrap">
            <Box flex="1" minW="280px">
              <AsciiFrame variant="single" label="ENGINE">
                <Stack spacing="sm">
                  <Text as="p" weight="semibold">
                    Modern engine, quiet premium.
                  </Text>
                  <Text as="p" size="sm" color="muted">
                    One rendering core powers classic, modern, and rustic without a
                    single product rewrite.
                  </Text>
                </Stack>
              </AsciiFrame>
            </Box>
            <Box flex="1" minW="280px">
              <AsciiFrame variant="double" label="VERIFIED" aria-label="Verified engineering claim">
                <Stack spacing="sm">
                  <Text as="p" weight="semibold">
                    601 use cases. 601 documented.
                  </Text>
                  <Text as="p" size="sm" color="muted">
                    Every capability ships with a contract, a test, and a doc page
                    before it reaches a tenant.
                  </Text>
                </Stack>
              </AsciiFrame>
            </Box>
          </Flex>
          </Box>
        </InvertSection>
      );
    case 'crop-marks':
      return (
        <InvertSection surface="paper">
          {/* The ticks are drawn outside the wrapper box, so a consumer must
              leave lateral room or they extend the page's scroll area. */}
          <Box padding="lg">
          <CropMarks>
            <Box padding="lg">
              <Stack spacing="xs">
                <Text as="p" size="xs" color="muted">
                  RT-BTN-001
                </Text>
                <Text as="p" weight="semibold">
                  Primary button, modern engine.
                </Text>
                <Text as="p" size="sm" color="muted">
                  Registration ticks mark this as a premium, framed specimen — the
                  same language a blueprint sheet uses to call out a live component.
                </Text>
              </Stack>
            </Box>
          </CropMarks>
          </Box>
        </InvertSection>
      );
    case 'invert-section':
      return (
        <Stack spacing="none">
          <InvertSection surface="ink">
            <Stack spacing="xs">
              <Text as="p" weight="semibold">
                Full black.
              </Text>
              <Text as="p" size="sm" color="muted">
                The section boundary reads through inversion alone — never a
                gradient, never a tint.
              </Text>
            </Stack>
          </InvertSection>
          <InvertSection surface="paper">
            <Stack spacing="xs">
              <Text as="p" weight="semibold">
                Full white.
              </Text>
              <Text as="p" size="sm" color="muted">
                Crossing the hairline is deliberate: paper answers ink with the same
                confidence.
              </Text>
            </Stack>
          </InvertSection>
        </Stack>
      );
    case 'section-frame':
      return (
        <InvertSection surface="ink">
          <SectionFrame
            index={2}
            title="What the platform actually ships to every vertical"
            meta="3 verticals"
          >
            <Stack spacing="sm">
              <Text as="p" size="sm" color="muted">
                BitHire, Evnto, and the admin console all inherit the same engine,
                the same contract layer, and the same design system.
              </Text>
              <Text as="p" size="sm" color="muted">
                Nothing is forked. Nothing is copy-pasted per tenant.
              </Text>
            </Stack>
          </SectionFrame>
        </InvertSection>
      );
    case 'texture-backdrop':
      return (
        <Stack spacing="none">
          <InvertSection surface="ink">
            <Flex gap="xl" wrap="wrap">
              <TextureBackdrop pattern="dots">
                <Box padding="xl">
                  <Stack spacing="xs">
                    <Text as="p" size="sm" weight="semibold">
                      Dot grid
                    </Text>
                    <Text as="p" size="xs" color="muted">
                      Whisper-contrast backdrop on ink.
                    </Text>
                  </Stack>
                </Box>
              </TextureBackdrop>
              <TextureBackdrop pattern="graph">
                <Box padding="xl">
                  <Stack spacing="xs">
                    <Text as="p" size="sm" weight="semibold">
                      Graph paper
                    </Text>
                    <Text as="p" size="xs" color="muted">
                      Backs hero and diagram zones.
                    </Text>
                  </Stack>
                </Box>
              </TextureBackdrop>
            </Flex>
          </InvertSection>
          <InvertSection surface="paper">
            <Flex gap="xl" wrap="wrap">
              <TextureBackdrop pattern="hatch">
                <Box padding="xl">
                  <Stack spacing="xs">
                    <Text as="p" size="sm" weight="semibold">
                      Diagonal hatch
                    </Text>
                    <Text as="p" size="xs" color="muted">
                      Switches to ink texture on paper.
                    </Text>
                  </Stack>
                </Box>
              </TextureBackdrop>
              <TextureBackdrop pattern="halftone">
                <Box padding="xl">
                  <Stack spacing="xs">
                    <Text as="p" size="sm" weight="semibold">
                      Halftone screen
                    </Text>
                    <Text as="p" size="xs" color="muted">
                      A grayscale Ben-day dot density shift.
                    </Text>
                  </Stack>
                </Box>
              </TextureBackdrop>
            </Flex>
          </InvertSection>
        </Stack>
      );
    default:
      return null;
  }
}

export const CONFIG_COMMERCIAL_A_SLUGS = [
  'ascii-frame',
  'crop-marks',
  'invert-section',
  'section-frame',
  'texture-backdrop',
];
