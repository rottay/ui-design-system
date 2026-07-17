import type { ReactNode } from "react";

import type { FeaturePictogramName } from '../../../foundation/catalog';

type Artwork = () => ReactNode;

const common = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  vectorEffect: "non-scaling-stroke" as const,
};

const halo = (
  <>
    <circle cx="48" cy="48" r="39" fill="currentColor" opacity="0.055" />
    <circle cx="48" cy="48" r="31" fill="currentColor" opacity="0.045" />
  </>
);

const AiAssistant: Artwork = () => (
  <>
    {halo}
    <path
      {...common}
      d="M31 37c0-7 5.8-12 13-12h8c7.2 0 13 5 13 12v18c0 7-5.8 12-13 12h-8c-7.2 0-13-5-13-12V37Z"
    />
    <path
      {...common}
      d="M48 25v-7m-4 0h8M38 46h.01M58 46h.01M40 56c5 3.7 11 3.7 16 0"
    />
    <path
      {...common}
      d="m68 29 1.8 4.2L74 35l-4.2 1.8L68 41l-1.8-4.2L62 35l4.2-1.8L68 29Z"
    />
  </>
);

const AnalyticsInsight: Artwork = () => (
  <>
    {halo}
    <path {...common} d="M25 69V31m0 38h48" />
    <path {...common} d="m31 58 10-11 9 7 14-18 8 6" />
    <circle cx="41" cy="47" r="3.2" fill="currentColor" />
    <circle cx="50" cy="54" r="3.2" fill="currentColor" />
    <circle cx="64" cy="36" r="3.2" fill="currentColor" />
    <path {...common} d="M34 66V61m10 5v-7m10 7V56m10 10V49" opacity=".55" />
  </>
);

const CandidateEvidence: Artwork = () => (
  <>
    {halo}
    <rect {...common} x="27" y="22" width="34" height="49" rx="7" />
    <circle {...common} cx="44" cy="37" r="7" />
    <path {...common} d="M34 54c2.7-5 6-7 10-7s7.3 2 10 7M34 61h13" />
    <circle cx="64" cy="61" r="13" fill="currentColor" opacity=".12" />
    <path {...common} d="m58.5 61 3.6 3.6 7-8" />
  </>
);

const EmptySearch: Artwork = () => (
  <>
    {halo}
    <circle {...common} cx="43" cy="43" r="17" />
    <path {...common} d="m55 55 14 14" />
    <path {...common} d="M35 42h16M39 49h8" opacity=".58" />
    <path {...common} d="M67 26v8m-4-4h8" />
  </>
);

const EventMoment: Artwork = () => (
  <>
    {halo}
    <rect {...common} x="25" y="29" width="46" height="40" rx="7" />
    <path {...common} d="M25 41h46M36 24v10m24-10v10" />
    <path
      {...common}
      d="m48 47 2.6 6 6.4.6-4.8 4.2 1.4 6.2-5.6-3.2-5.6 3.2 1.4-6.2-4.8-4.2 6.4-.6L48 47Z"
    />
  </>
);

const SecureAccess: Artwork = () => (
  <>
    {halo}
    <path
      {...common}
      d="M48 20c8 6 15 7 21 8v17c0 13-7.5 23-21 31-13.5-8-21-18-21-31V28c6-1 13-2 21-8Z"
    />
    <rect {...common} x="39" y="43" width="18" height="15" rx="4" />
    <path {...common} d="M43 43v-4a5 5 0 0 1 10 0v4m-5 7v3" />
  </>
);

const TeamCollaboration: Artwork = () => (
  <>
    {halo}
    <circle {...common} cx="48" cy="35" r="8" />
    <circle {...common} cx="29" cy="44" r="6" />
    <circle {...common} cx="67" cy="44" r="6" />
    <path
      {...common}
      d="M34 66c1.8-10 6.5-15 14-15s12.2 5 14 15M19 66c1-8 4.3-12 10-12 3 0 5.4 1.1 7.2 3.2M77 66c-1-8-4.3-12-10-12-3 0-5.4 1.1-7.2 3.2"
    />
  </>
);

const WorkflowAutomation: Artwork = () => (
  <>
    {halo}
    <rect {...common} x="20" y="38" width="17" height="17" rx="5" />
    <rect {...common} x="59" y="20" width="17" height="17" rx="5" />
    <rect {...common} x="59" y="59" width="17" height="17" rx="5" />
    <path
      {...common}
      d="M37 46.5h9c8 0 13-5 13-13v-5M37 46.5h9c8 0 13 5 13 13v8"
    />
    <path {...common} d="m51 42 5 4.5-5 4.5" />
    <circle cx="28.5" cy="46.5" r="3" fill="currentColor" />
    <path {...common} d="m65 28.5 2 2 4-4m-6 41 2 2 4-4" />
  </>
);

export const FEATURE_PICTOGRAM_ARTWORK: Readonly<
  Record<FeaturePictogramName, Artwork>
> = {
  "ai-assistant": AiAssistant,
  "analytics-insight": AnalyticsInsight,
  "candidate-evidence": CandidateEvidence,
  "empty-search": EmptySearch,
  "event-moment": EventMoment,
  "secure-access": SecureAccess,
  "team-collaboration": TeamCollaboration,
  "workflow-automation": WorkflowAutomation,
};
