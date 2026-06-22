import { useCallback, useEffect, useRef, useState } from 'react';
import type { EditorSaveState } from '../components/portal/writing/editor/EditorStatus';

type UseDebouncedWritingSaveOptions<T> = {
  delayMs?: number;
  enabled: boolean;
  onSave: (value: T) => Promise<void>;
  ready: boolean;
  value: T;
};

const serialize = (value: unknown) => JSON.stringify(value);

export const useDebouncedWritingSave = <T>({
  delayMs = 900,
  enabled,
  onSave,
  ready,
  value,
}: UseDebouncedWritingSaveOptions<T>) => {
  const [saveState, setSaveState] = useState<EditorSaveState>('idle');
  const lastSavedValue = useRef('');
  const previousReady = useRef(false);
  const valueRef = useRef(value);
  const onSaveRef = useRef(onSave);

  valueRef.current = value;
  onSaveRef.current = onSave;

  const persist = useCallback(async (force = false) => {
    if (!ready || !enabled) return;

    const nextValue = valueRef.current;
    const nextSerializedValue = serialize(nextValue);
    if (!force && nextSerializedValue === lastSavedValue.current) return;

    setSaveState('saving');

    try {
      await onSaveRef.current(nextValue);
      lastSavedValue.current = nextSerializedValue;
      setSaveState('saved');
    } catch {
      setSaveState('error');
    }
  }, [enabled, ready]);

  useEffect(() => {
    const serializedValue = serialize(value);

    if (!ready) {
      previousReady.current = false;
      lastSavedValue.current = serializedValue;
      setSaveState('idle');
      return;
    }

    if (!previousReady.current) {
      previousReady.current = true;
      lastSavedValue.current = serializedValue;
      setSaveState('saved');
      return;
    }

    if (!enabled || serializedValue === lastSavedValue.current) return;

    const timeout = globalThis.setTimeout(() => {
      void persist();
    }, delayMs);

    return () => globalThis.clearTimeout(timeout);
  }, [delayMs, enabled, persist, ready, value]);

  return {
    saveNow: () => persist(true),
    saveState,
  };
};