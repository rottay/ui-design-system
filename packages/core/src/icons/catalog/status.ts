'use client';

/**
 * @fileoverview Status icons - checks, alerts, loading indicators
 */

import {
  Check,
  CheckCircle,
  CheckCircle2,
  X,
  XCircle,
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Info,
  Ban,
  LoaderCircle,
  CircleAlert,
} from 'lucide-react';
import { createIcon } from '../factory';

export const CheckIcon = createIcon(Check, 'CheckIcon');
export const CheckCircleIcon = createIcon(CheckCircle, 'CheckCircleIcon');
export const CheckCircle2Icon = createIcon(CheckCircle2, 'CheckCircle2Icon');
export const XIcon = createIcon(X, 'XIcon');
export const XCircleIcon = createIcon(XCircle, 'XCircleIcon');
export const AlertCircleIcon = createIcon(AlertCircle, 'AlertCircleIcon');
export const AlertTriangleIcon = createIcon(AlertTriangle, 'AlertTriangleIcon');
export const AlertOctagonIcon = createIcon(AlertOctagon, 'AlertOctagonIcon');
export const InfoIcon = createIcon(Info, 'InfoIcon');
export const BanIcon = createIcon(Ban, 'BanIcon');
export const LoaderCircleIcon = createIcon(LoaderCircle, 'LoaderCircleIcon');
export const CircleAlertIcon = createIcon(CircleAlert, 'CircleAlertIcon');
