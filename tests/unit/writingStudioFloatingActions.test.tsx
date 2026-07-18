// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingStudioFloatingActions from '../../src/components/portal/writing/WritingStudioFloatingActions';

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

describe('WritingStudioFloatingActions', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('renders shared editor actions and respects disabled state', async () => {
    const onSave = vi.fn();
    const onSubmit = vi.fn();

    await act(async () => {
      root.render(
        <WritingStudioFloatingActions
          actions={[
            { ariaLabel: 'Save draft', disabled: true, label: 'Save', onClick: onSave },
            { ariaLabel: 'Submit for review', label: 'Submit', onClick: onSubmit, variant: 'primary' },
          ]}
        />,
      );
    });

    const save = container.querySelector('[aria-label="Save draft"]') as HTMLButtonElement;
    const submit = container.querySelector('[aria-label="Submit for review"]') as HTMLButtonElement;

    expect(save.disabled).toBe(true);
    expect(submit.textContent).toContain('Submit');

    await act(async () => submit.click());

    expect(onSave).not.toHaveBeenCalled();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
