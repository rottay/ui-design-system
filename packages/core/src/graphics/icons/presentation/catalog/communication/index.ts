"use client";

/**
 * @fileoverview Communication icons - mail, messaging, notifications
 */

import { BellIcon as Bell } from "@phosphor-icons/react/dist/ssr/Bell";
import { PhoneIcon as Phone } from "@phosphor-icons/react/dist/ssr/Phone";
import { PhoneCallIcon as PhoneCall } from "@phosphor-icons/react/dist/ssr/PhoneCall";
import { PhoneIncomingIcon as PhoneIncoming } from "@phosphor-icons/react/dist/ssr/PhoneIncoming";
import { EnvelopeIcon as Mail } from "@phosphor-icons/react/dist/ssr/Envelope";
import { EnvelopeOpenIcon as MailOpen } from "@phosphor-icons/react/dist/ssr/EnvelopeOpen";
import { ChatCenteredIcon as MessageSquare } from "@phosphor-icons/react/dist/ssr/ChatCentered";
import { ChatsIcon as MessageSquarePlus } from "@phosphor-icons/react/dist/ssr/Chats";
import { QuotesIcon as MessageSquareQuote } from "@phosphor-icons/react/dist/ssr/Quotes";
import { ChatCenteredTextIcon as MessageSquareText } from "@phosphor-icons/react/dist/ssr/ChatCenteredText";
import { ChatCenteredDotsIcon as MessageSquareWarning } from "@phosphor-icons/react/dist/ssr/ChatCenteredDots";
import { BellSlashIcon as BellOff } from "@phosphor-icons/react/dist/ssr/BellSlash";
import { PhoneDisconnectIcon as PhoneOff } from "@phosphor-icons/react/dist/ssr/PhoneDisconnect";
import { TrayIcon as Inbox } from "@phosphor-icons/react/dist/ssr/Tray";
import { PaperPlaneTiltIcon as Send } from "@phosphor-icons/react/dist/ssr/PaperPlaneTilt";
import { ChatCircleIcon as MessageCircle } from "@phosphor-icons/react/dist/ssr/ChatCircle";
import { DeviceMobileIcon as Smartphone } from "@phosphor-icons/react/dist/ssr/DeviceMobile";
import { createPhosphorCompatibilityIcon } from "../../../runtime/factory/phosphor-compat";

export const MailIcon = createPhosphorCompatibilityIcon(Mail, "MailIcon");
export const MessageSquareIcon = createPhosphorCompatibilityIcon(
  MessageSquare,
  "MessageSquareIcon"
);
export const BellIcon = createPhosphorCompatibilityIcon(Bell, "BellIcon");
export const BellOffIcon = createPhosphorCompatibilityIcon(
  BellOff,
  "BellOffIcon"
);
export const PhoneIcon = createPhosphorCompatibilityIcon(Phone, "PhoneIcon");
export const InboxIcon = createPhosphorCompatibilityIcon(Inbox, "InboxIcon");
// Note: Send is also in action.ts. This re-creates it under the same name
// for categorical completeness. The barrel de-duplicates via re-export.
export const SendMessageIcon = createPhosphorCompatibilityIcon(
  Send,
  "SendMessageIcon"
);
export const MessageCircleIcon = createPhosphorCompatibilityIcon(
  MessageCircle,
  "MessageCircleIcon"
);
export const PhoneIncomingIcon = createPhosphorCompatibilityIcon(
  PhoneIncoming,
  "PhoneIncomingIcon"
);
export const SmartphoneIcon = createPhosphorCompatibilityIcon(
  Smartphone,
  "SmartphoneIcon"
);
export const MailOpenIcon = createPhosphorCompatibilityIcon(
  MailOpen,
  "MailOpenIcon"
);
export const MessageSquarePlusIcon = createPhosphorCompatibilityIcon(
  MessageSquarePlus,
  "MessageSquarePlusIcon"
);
export const MessageSquareQuoteIcon = createPhosphorCompatibilityIcon(
  MessageSquareQuote,
  "MessageSquareQuoteIcon"
);
export const MessageSquareTextIcon = createPhosphorCompatibilityIcon(
  MessageSquareText,
  "MessageSquareTextIcon"
);
export const MessageSquareWarningIcon = createPhosphorCompatibilityIcon(
  MessageSquareWarning,
  "MessageSquareWarningIcon"
);
export const PhoneCallIcon = createPhosphorCompatibilityIcon(
  PhoneCall,
  "PhoneCallIcon"
);
export const PhoneOffIcon = createPhosphorCompatibilityIcon(
  PhoneOff,
  "PhoneOffIcon"
);
