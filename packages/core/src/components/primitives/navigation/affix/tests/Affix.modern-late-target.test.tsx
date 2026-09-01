import React, { useCallback, useRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import ModernAffix from '../engines/modern';

describe('Affix modern: late-mounting scroll container', () => {
  it('binds the scroll listener to a container that attaches after the first commit', () => {
    const onChange = vi.fn();
    const addSpy = vi.fn();

    function Harness() {
      const boxRef = useRef<HTMLDivElement | null>(null);
      const [mounted, setMounted] = useState(false);
      const target = useCallback(() => boxRef.current, []);

      return (
        <div>
          <button type="button" onClick={() => setMounted(true)}>
            mount container
          </button>
          {mounted ? (
            <div
              data-testid="scroll-box"
              ref={(node) => {
                boxRef.current = node;
                if (node) {
                  const original = node.addEventListener.bind(node);
                  node.addEventListener = (
                    type: string,
                    listener: EventListenerOrEventListenerObject,
                    options?: boolean | AddEventListenerOptions
                  ) => {
                    addSpy(type);
                    original(type, listener, options);
                  };
                }
              }}
            />
          ) : null}
          <ModernAffix target={target} onChange={onChange}>
            <span>affixed content</span>
          </ModernAffix>
        </div>
      );
    }

    render(<Harness />);
    expect(addSpy).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'mount container' }));

    expect(addSpy.mock.calls.map(([type]) => type)).toContain('scroll');
  });
});
