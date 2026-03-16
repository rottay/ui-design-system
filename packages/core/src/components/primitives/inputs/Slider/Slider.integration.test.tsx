import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { renderWithEngine } from '../../../../testing/helpers/engine-test-utils';

describe('Slider integration', () => {
  it.each(['modern', 'rustic'] as const)(
    'changes single values in the %s engine',
    async (engine) => {
      const { Slider } = await import('..');
      const onChange = vi.fn();
      const onChangeComplete = vi.fn();

      renderWithEngine(
        <Slider engine={engine} min={0} max={100} defaultValue={25} onChange={onChange} onChangeComplete={onChangeComplete} />,
        engine
      );

      const slider = (await screen.findAllByRole('slider'))[0];
      fireEvent.change(slider, { target: { value: '40' } });
      fireEvent.mouseUp(slider);

      expect(onChange).toHaveBeenCalledWith(40);
      expect(onChangeComplete).toHaveBeenCalled();
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'supports range mode in the %s engine',
    async (engine) => {
      const { Slider } = await import('..');
      const onChange = vi.fn();

      renderWithEngine(
        <Slider engine={engine} range min={0} max={100} defaultValue={[20, 80]} onChange={onChange} />,
        engine
      );

      const sliders = await screen.findAllByRole('slider');
      expect(sliders).toHaveLength(2);

      fireEvent.change(sliders[0], { target: { value: '30' } });
      expect(onChange).toHaveBeenCalledWith([30, 80]);
    }
  );

  it.each(['modern', 'rustic'] as const)(
    'renders marks and vertical mode in the %s engine',
    async (engine) => {
      const { Slider } = await import('..');

      renderWithEngine(
        <Slider
          engine={engine}
          vertical
          marks={{ 0: 'Low', 100: 'High' }}
          defaultValue={50}
          style={{ height: 240 }}
        />,
        engine
      );

      await screen.findByText('Low');
      expect(screen.getByText('High')).toBeInTheDocument();
    }
  );
});
