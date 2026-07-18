"use client";

/**
 * @fileoverview Media icons - visibility, ratings, audio, visual
 */

import { EyeIcon as Eye } from "@phosphor-icons/react/dist/ssr/Eye";
import { StarIcon as Star } from "@phosphor-icons/react/dist/ssr/Star";
import { CameraIcon as Camera } from "@phosphor-icons/react/dist/ssr/Camera";
import { PlayIcon as Play } from "@phosphor-icons/react/dist/ssr/Play";
import { PlayCircleIcon as PlayCircle } from "@phosphor-icons/react/dist/ssr/PlayCircle";
import { PauseIcon as Pause } from "@phosphor-icons/react/dist/ssr/Pause";
import { PauseCircleIcon as PauseCircle } from "@phosphor-icons/react/dist/ssr/PauseCircle";
import { VideoIcon as Video } from "@phosphor-icons/react/dist/ssr/Video";
import { MonitorIcon as Monitor } from "@phosphor-icons/react/dist/ssr/Monitor";
import { EyeSlashIcon as EyeOff } from "@phosphor-icons/react/dist/ssr/EyeSlash";
import { LightningIcon as Zap } from "@phosphor-icons/react/dist/ssr/Lightning";
import { SparkleIcon as Sparkles } from "@phosphor-icons/react/dist/ssr/Sparkle";
import { MicrophoneIcon as Mic } from "@phosphor-icons/react/dist/ssr/Microphone";
import { MicrophoneStageIcon as Mic2 } from "@phosphor-icons/react/dist/ssr/MicrophoneStage";
import { MicrophoneStageIcon as MicVocal } from "@phosphor-icons/react/dist/ssr/MicrophoneStage";
import { MicrophoneSlashIcon as MicOff } from "@phosphor-icons/react/dist/ssr/MicrophoneSlash";
import { WaveformIcon as AudioLines } from "@phosphor-icons/react/dist/ssr/Waveform";
import { SpeakerHighIcon as Volume2 } from "@phosphor-icons/react/dist/ssr/SpeakerHigh";
import { SpeakerXIcon as VolumeX } from "@phosphor-icons/react/dist/ssr/SpeakerX";
import { MusicNotesIcon as Music } from "@phosphor-icons/react/dist/ssr/MusicNotes";
import { createPhosphorCompatibilityIcon } from "../../../runtime/factory/phosphor-compat";

export const EyeIcon = createPhosphorCompatibilityIcon(Eye, "EyeIcon");
export const EyeOffIcon = createPhosphorCompatibilityIcon(EyeOff, "EyeOffIcon");
export const StarIcon = createPhosphorCompatibilityIcon(Star, "StarIcon");
export const ZapIcon = createPhosphorCompatibilityIcon(Zap, "ZapIcon");
export const SparklesIcon = createPhosphorCompatibilityIcon(
  Sparkles,
  "SparklesIcon"
);
export const MicIcon = createPhosphorCompatibilityIcon(Mic, "MicIcon");
export const Mic2Icon = createPhosphorCompatibilityIcon(Mic2, "Mic2Icon");
export const MicVocalIcon = createPhosphorCompatibilityIcon(
  MicVocal,
  "MicVocalIcon"
);
export const MicOffIcon = createPhosphorCompatibilityIcon(MicOff, "MicOffIcon");
export const AudioLinesIcon = createPhosphorCompatibilityIcon(
  AudioLines,
  "AudioLinesIcon"
);
export const CameraIcon = createPhosphorCompatibilityIcon(Camera, "CameraIcon");
export const PlayIcon = createPhosphorCompatibilityIcon(Play, "PlayIcon");
export const VideoIcon = createPhosphorCompatibilityIcon(Video, "VideoIcon");
export const Volume2Icon = createPhosphorCompatibilityIcon(
  Volume2,
  "Volume2Icon"
);
export const VolumeXIcon = createPhosphorCompatibilityIcon(
  VolumeX,
  "VolumeXIcon"
);
export const MonitorIcon = createPhosphorCompatibilityIcon(
  Monitor,
  "MonitorIcon"
);
export const MusicIcon = createPhosphorCompatibilityIcon(Music, "MusicIcon");
export const PlayCircleIcon = createPhosphorCompatibilityIcon(
  PlayCircle,
  "PlayCircleIcon"
);
export const PauseIcon = createPhosphorCompatibilityIcon(Pause, "PauseIcon");
export const PauseCircleIcon = createPhosphorCompatibilityIcon(
  PauseCircle,
  "PauseCircleIcon"
);
