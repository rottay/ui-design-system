'use client';

/**
 * @fileoverview Communication icons - mail, messaging, notifications
 */

import {
  Mail,
  MessageSquare,
  Bell,
  Phone,
  Inbox,
  Send,
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
