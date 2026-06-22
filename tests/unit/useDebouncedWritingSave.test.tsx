// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedWritingSave } from '../../src/hooks/useDebouncedWritingSave';

type HarnessProps = {
  enabled: boolean;
  onSave: (value: { title: string }) => Promise<void>;
  onState: (state: ReturnType<typeof useDebouncedWritingSave<{ title: string }>>) => void;
  ready: boolean;
  value: { title: string };
};

const Harness = ({ enabled, onSave, onState, ready, value }: HarnessProps) => {
  onState(useDebouncedWritingSave({ delayMs: 500, enabled, onSave, ready, value }));
  return null;
};

describe('useDebouncedWritingSave', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  const renderHook = async (props: Omit<HarnessProps, 'onState'>) => {
    let current: ReturnType<typeof useDebouncedWritingSave<{ title: string }>> | undefined;
    await act(async () => {
      root.render(<Harness {...props} onState={(state) => { current = state; }} />);
    });
    return current as ReturnType<typeof useDebouncedWritingSave<{ title: string }>>;
  };

  it('does not save the initial fetched draft, then debounces later edits', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    await renderHook({ enabled: true, onSave, ready: true, value: { title: 'Original' } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(onSave).not.toHaveBeenCalled();

    await renderHook({ enabled: true, onSave, ready: true, value: { title: 'Revised' } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(499);
    });
    expect(onSave).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(onSave).toHaveBeenCalledWith({ title: 'Revised' });
  });

  it('saves immediately when the explicit action is used', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const state = await renderHook({ enabled: true, onSave, ready: true, value: { title: 'Draft' } });

    await act(async () => {
      await state.saveNow();
    });

    expect(onSave).toHaveBeenCalledWith({ title: 'Draft' });
    expect(state.saveState).toBe('saved');
  });

  it('reports a quiet error state when a save fails', async () => {
    const onSave = vi.fn().mockRejectedValue(new Error('Network unavailable'));
    let state = await renderHook({ enabled: true, onSave, ready: true, value: { title: 'Draft' } });

    await act(async () => {
      await state.saveNow();
    });
    state = await renderHook({ enabled: true, onSave, ready: true, value: { title: 'Draft' } });

    expect(state.saveState).toBe('error');
  });
});
