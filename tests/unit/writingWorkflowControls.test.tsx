// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WritingWorkflowControls, { WritingPublishingPanel } from '../../src/components/portal/writing/WritingWorkflowControls';

const callbacks = {
  onPublish: vi.fn().mockResolvedValue(true),
  onReturnToDraft: vi.fn().mockResolvedValue(true),
  onSchedule: vi.fn().mockResolvedValue(true),
  onSubmitForReview: vi.fn().mockResolvedValue(true),
  onUnschedule: vi.fn().mockResolvedValue(true),
};

const renderControls = async (root: Root, props: Partial<React.ComponentProps<typeof WritingWorkflowControls>>) => {
  await act(async () => {
    root.render(<WritingWorkflowControls canReturnToDraft={false} canSubmitForReview={false} canUnschedule={false} darkMode={false} saving={false} status="DRAFT" {...callbacks} {...props} />);
  });
};

describe('WritingWorkflowControls', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    vi.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it('shows submit only for an eligible draft', async () => {
    await renderControls(root, { canSubmitForReview: true });
    expect(container.textContent).toContain('Submit for review');
    expect(container.textContent).not.toContain('Schedule Publication');
  });

  it('keeps publishing controls out of the editorial workflow', async () => {
    await renderControls(root, { canReturnToDraft: true, status: 'IN_REVIEW' });
    expect(container.textContent).toContain('Return to draft');
    expect(container.textContent).not.toContain('Schedule Publication');
  });

  it('houses scheduling in the publishing panel', async () => {
    await act(async () => {
      root.render(<WritingPublishingPanel canPublish={false} canSchedule darkMode={false} onPublish={callbacks.onPublish} onSchedule={callbacks.onSchedule} saving={false} />);
    });
    expect(container.textContent).toContain('Schedule Publication');
    expect(container.textContent).toContain('Date and Time');
  });

  it('shows cancellation for an eligible scheduled writing', async () => {
    await renderControls(root, { canUnschedule: true, scheduledFor: '2026-06-30T06:00:00Z', status: 'SCHEDULED' });
    expect(container.textContent).toContain('Cancel scheduling');
    expect(container.textContent).toContain('Scheduled for');
  });
});
