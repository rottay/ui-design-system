'use client';

/**
 * @fileoverview Communication icons - mail, messaging, notifications
 */

import {
  Mail,
  MailOpen,
  MessageSquare,
  MessageSquarePlus,
  MessageSquareQuote,
  MessageSquareText,
  MessageSquareWarning,
  Bell,
  Phone,
  PhoneCall,
  PhoneOff,
  Inbox,
  Send,
  MessageCircle,
  PhoneIncoming,
  Smartphone,
} from 'lucide-react';
import { createIcon } from '../factory';

export const MailIcon = createIcon(Mail, 'MailIcon');
export const MessageSquareIcon = createIcon(MessageSquare, 'MessageSquareIcon');
export const BellIcon = createIcon(Bell, 'BellIcon');
export const PhoneIcon = createIcon(Phone, 'PhoneIcon');
export const InboxIcon = createIcon(Inbox, 'InboxIcon');
// Note: Send is also in action.ts. This re-creates it under the same name
// for categorical completeness. The barrel de-duplicates via re-export.
export const SendMessageIcon = createIcon(Send, 'SendMessageIcon');
export const MessageCircleIcon = createIcon(MessageCircle, 'MessageCircleIcon');
export const PhoneIncomingIcon = createIcon(PhoneIncoming, 'PhoneIncomingIcon');
export const SmartphoneIcon = createIcon(Smartphone, 'SmartphoneIcon');
export const MailOpenIcon = createIcon(MailOpen, 'MailOpenIcon');
export const MessageSquarePlusIcon = createIcon(MessageSquarePlus, 'MessageSquarePlusIcon');
export const MessageSquareQuoteIcon = createIcon(MessageSquareQuote, 'MessageSquareQuoteIcon');
export const MessageSquareTextIcon = createIcon(MessageSquareText, 'MessageSquareTextIcon');
export const MessageSquareWarningIcon = createIcon(MessageSquareWarning, 'MessageSquareWarningIcon');
export const PhoneCallIcon = createIcon(PhoneCall, 'PhoneCallIcon');
export const PhoneOffIcon = createIcon(PhoneOff, 'PhoneOffIcon');
