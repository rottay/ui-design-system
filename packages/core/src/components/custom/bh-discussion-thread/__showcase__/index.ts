/**
 * bh-discussion-thread - Showcase Mock Data
 *
 * Mock/demo data for storybook, playground, and development preview.
 * NOT used in production - import from here for showcase/demo purposes only.
 */

import type { DiscussionThread, DiscussionComment, DiscussionAuthor } from '../core';

const authorSofia: DiscussionAuthor = { id: 'u1', name: 'Sofia Martinez', role: 'Senior Recruiter' };
const authorJames: DiscussionAuthor = { id: 'u2', name: 'James Chen', role: 'Hiring Manager' };
const authorPriya: DiscussionAuthor = { id: 'u3', name: 'Priya Sharma', role: 'Technical Lead' };
const authorMarcus: DiscussionAuthor = { id: 'u4', name: 'Marcus Williams', role: 'VP Engineering' };

export const MOCK_THREADS: DiscussionThread[] = [
  {
    id: 'th1',
    title: 'Salary expectations mismatch',
    entityType: 'candidate',
    entityId: 'c1',
    entityName: 'Emily Watson',
    status: 'open',
    createdBy: authorSofia,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    lastActivityAt: new Date(Date.now() - 300000).toISOString(),
    commentCount: 4,
    unreadCount: 2,
    participants: [authorSofia, authorJames, authorMarcus],
  },
  {
    id: 'th2',
    title: 'Technical assessment feedback',
    entityType: 'interview',
    entityId: 'i1',
    entityName: 'System Design - Alex Kim',
    status: 'open',
    createdBy: authorPriya,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 1800000).toISOString(),
    commentCount: 3,
    unreadCount: 0,
    participants: [authorPriya, authorJames],
  },
  {
    id: 'th3',
    title: 'Role scope clarification needed',
    entityType: 'job',
    entityId: 'j1',
    entityName: 'Staff Engineer - Platform',
    status: 'resolved',
    createdBy: authorJames,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    lastActivityAt: new Date(Date.now() - 43200000).toISOString(),
    commentCount: 5,
    unreadCount: 0,
    participants: [authorJames, authorMarcus, authorPriya],
  },
  {
    id: 'th4',
    title: 'Competing offer situation',
    entityType: 'offer',
    entityId: 'o1',
    entityName: 'Offer #1247 - Rachel Green',
    status: 'open',
    createdBy: authorSofia,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    lastActivityAt: new Date(Date.now() - 600000).toISOString(),
    commentCount: 2,
    unreadCount: 1,
    participants: [authorSofia, authorJames],
  },
  {
    id: 'th5',
    title: 'Headcount planning Q2',
    entityType: 'position',
    entityId: 'p1',
    entityName: 'Engineering Positions Q2',
    status: 'archived',
    createdBy: authorMarcus,
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    lastActivityAt: new Date(Date.now() - 259200000).toISOString(),
    commentCount: 8,
    unreadCount: 0,
    participants: [authorMarcus, authorJames, authorPriya, authorSofia],
  },
  {
    id: 'th6',
    title: 'Reference check follow-up',
    entityType: 'candidate',
    entityId: 'c2',
    entityName: 'David Park',
    status: 'resolved',
    createdBy: authorSofia,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    lastActivityAt: new Date(Date.now() - 86400000).toISOString(),
    commentCount: 3,
    unreadCount: 0,
    participants: [authorSofia, authorJames],
  },
];

export const MOCK_COMMENTS: DiscussionComment[] = [
  /* Thread 1 comments */
  {
    id: 'c1',
    threadId: 'th1',
    author: authorSofia,
    content: 'Emily mentioned during the call that her expected base is $180k. The approved range for this role is $140k-$160k. How should we approach this?',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reactions: [
      { emoji: '1', count: 2, reacted: false },
    ],
  },
  {
    id: 'c2',
    threadId: 'th1',
    author: authorJames,
    content: 'We could consider including a sign-on bonus to bridge the gap. Her skills in distributed systems are exactly what we need for the platform rewrite.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    reactions: [
      { emoji: '1', count: 1, reacted: true },
    ],
  },
  {
    id: 'c3',
    threadId: 'th1',
    author: authorMarcus,
    content: 'I can approve up to $165k base given her experience level. Combine that with a $15k sign-on bonus and the equity package. Let me know if that works.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'c4',
    threadId: 'th1',
    author: authorSofia,
    content: 'That should work. I will draft the updated offer letter and share it before reaching out to Emily.',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    isEdited: true,
  },

  /* Thread 2 comments */
  {
    id: 'c5',
    threadId: 'th2',
    author: authorPriya,
    content: 'Alex did well on the coding portion but struggled with the system design problem. He proposed a monolithic solution rather than considering microservices for the scale we discussed.',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    attachments: [
      { id: 'att1', name: 'alex-kim-assessment.pdf', type: 'application/pdf', size: 245000 },
    ],
  },
  {
    id: 'c6',
    threadId: 'th2',
    author: authorJames,
    content: 'Do you think he could grow into the role with mentoring? His coding skills seem strong and the system design gap might be addressable.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'c7',
    threadId: 'th2',
    author: authorPriya,
    content: 'Possibly, but for a senior role I would expect more architectural thinking. I recommend we proceed with a second design interview focusing on a different problem space.',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    reactions: [
      { emoji: '1', count: 2, reacted: true },
    ],
  },

  /* Thread 4 comments */
  {
    id: 'c8',
    threadId: 'th4',
    author: authorSofia,
    content: 'Rachel mentioned she has received a competing offer from a FAANG company. They are offering $170k base with a generous RSU package. We need to decide quickly.',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'c9',
    threadId: 'th4',
    author: authorJames,
    content: 'Can we expedite our offer? She is a strong fit for the team and losing her would set back our hiring timeline significantly.',
    timestamp: new Date(Date.now() - 600000).toISOString(),
    reactions: [
      { emoji: '1', count: 1, reacted: false },
      { emoji: '2', count: 1, reacted: true },
    ],
  },
];
