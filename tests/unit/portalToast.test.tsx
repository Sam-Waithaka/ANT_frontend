// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PortalToastProvider, usePortalToast } from '../../src/components/portal/PortalToast';

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false }),
}));

const ToastTrigger = () => {
  const toast = usePortalToast();
  return <button onClick={() => toast.error('Add a title and resource type before creating the draft.')} type="button">Show toast</button>;
};

describe('PortalToastProvider', () => {
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

  it('shows and dismisses a portal toast', async () => {
    await act(async () => {
      root.render(
        <PortalToastProvider>
          <ToastTrigger />
        </PortalToastProvider>,
      );
    });

    await act(async () => {
      (container.querySelector('button') as HTMLButtonElement).click();
    });

    expect(container.textContent).toContain('Add a title and resource type before creating the draft.');

    await act(async () => {
      (container.querySelector('[aria-label="Dismiss notification"]') as HTMLButtonElement).click();
    });

    expect(container.textContent).not.toContain('Add a title and resource type before creating the draft.');
  });
});
