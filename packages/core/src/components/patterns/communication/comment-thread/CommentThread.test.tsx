import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import type { StableEngineName } from '../../../../_internal/testing/helpers/engine-test-utils';
import { STABLE_ENGINES, renderWithEngine } from '../../../../_internal/testing/helpers/engine-test-utils';
import type { CommentThreadProps } from './CommentThread.types';
import ClassicCommentThread from './engines/classic';
import ModernCommentThread from './engines/modern';
import RusticCommentThread from './engines/rustic';

const COMPONENTS: Record<StableEngineName, React.ComponentType<CommentThreadProps>> = {
  classic: ClassicCommentThread,
  modern: ModernCommentThread,
  rustic: RusticCommentThread,
};

function createProps(overrides: Partial<CommentThreadProps> = {}): CommentThreadProps {
  return {
    comments: [
      {
        id: 'c1',
        author: { name: 'Alice' },
        content: 'This looks great!',
        timestamp: new Date().toISOString(),
        replies: [
          {
            id: 'c2',
            author: { name: 'Bob' },
            content: 'Thanks Alice!',
            timestamp: new Date().toISOString(),
          },
        ],
      },
    ],
    currentUser: { name: 'Alice' },
    ...overrides,
  };
}

describe('PatternCommentThread', () => {
  it.each(STABLE_ENGINES)(
    'renders comments with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('This looks great!')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders nested replies with the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(<Component {...createProps()} />, engine);

      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('Thanks Alice!')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows empty message when no comments in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      renderWithEngine(
        <Component {...createProps({ comments: [], emptyMessage: 'Be the first to comment' })} />,
        engine,
      );

      expect(screen.getByText('Be the first to comment')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'renders comment input when onAdd and currentUser provided in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onAdd = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onAdd })} />,
        engine,
      );

      expect(screen.getByText('Comment')).toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'shows delete button for own comments in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onDelete = vi.fn();
      renderWithEngine(
        <Component {...createProps({ onDelete })} />,
        engine,
      );

      expect(screen.getAllByText('Delete').length).toBeGreaterThan(0);
    },
  );

  it.each(STABLE_ENGINES)(
    'supports add, reply, edit, delete, and reaction flows in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onAdd = vi.fn();
      const onReply = vi.fn();
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const onReaction = vi.fn();

      renderWithEngine(
        <Component
          {...createProps({
            onAdd,
            onReply,
            onEdit,
            onDelete,
            onReaction,
            comments: [
              {
                id: 'c1',
                author: { name: 'Alice' },
                content: 'This looks great!',
                edited: true,
                timestamp: new Date().toISOString(),
                reactions: [{ emoji: '👍', count: 2, active: true }],
                replies: [],
              },
            ],
          })}
        />,
        engine,
      );

      fireEvent.change(screen.getByPlaceholderText('Write a comment...'), {
        target: { value: 'Ship it' },
      });
      fireEvent.click(screen.getByText('Comment'));
      expect(onAdd).toHaveBeenCalledWith('Ship it');

      fireEvent.click(screen.getAllByText('Reply')[0]);
      fireEvent.change(screen.getByPlaceholderText('Write a reply...'), {
        target: { value: 'On it' },
      });
      const replyButtons = screen.getAllByText('Reply');
      fireEvent.click(replyButtons[replyButtons.length - 1]);
      expect(onReply).toHaveBeenCalledWith('c1', 'On it');

      fireEvent.click(screen.getAllByText('Edit')[0]);
      const editInput = screen.getByDisplayValue('This looks great!');
      fireEvent.change(editInput, { target: { value: 'Updated comment' } });
      fireEvent.click(screen.getByText('Save'));
      expect(onEdit).toHaveBeenCalledWith('c1', 'Updated comment');

      fireEvent.click(screen.getByText(/👍/));
      expect(onReaction).toHaveBeenCalledWith('c1', '👍');

      fireEvent.click(screen.getAllByText('Delete')[0]);
      expect(onDelete).toHaveBeenCalledWith('c1');
    },
  );

  it.each(STABLE_ENGINES)(
    'renders loading state and hides the composer without a current user in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const { container, rerender } = renderWithEngine(<Component {...createProps({ loading: true })} />, engine);

      expect(container.querySelector('.loading-spinner') || screen.queryByText(/loading/i)).toBeTruthy();

      rerender(
        <Component
          {...createProps({
            currentUser: undefined,
            onAdd: vi.fn(),
            loading: false,
          })}
        />
      );

      expect(screen.queryByPlaceholderText('Write a comment...')).not.toBeInTheDocument();
    },
  );

  it.each(STABLE_ENGINES)(
    'respects maxDepth and cancel flows in the %s engine',
    (engine) => {
      const Component = COMPONENTS[engine];
      const onReply = vi.fn();
      const onEdit = vi.fn();

      renderWithEngine(
        <Component
          {...createProps({
            maxDepth: 0,
            onReply,
            onEdit,
          })}
        />,
        engine,
      );

      expect(screen.queryByText('Reply')).not.toBeInTheDocument();

      fireEvent.click(screen.getAllByText('Edit')[0]);
      fireEvent.click(screen.getByText('Cancel'));
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByText('This looks great!')).toBeInTheDocument();
    },
  );
});
