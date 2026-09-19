// @vitest-environment jsdom

import React from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MemorialPortalShell from '../../src/components/portal/memorials/MemorialPortalShell';
import MemorialPortalPage from '../../src/pages/portal/memorials/MemorialPortalPage';

vi.mock('../../src/hooks/useTheme', () => ({
  useTheme: () => ({ darkMode: false, toggleTheme: vi.fn() }),
}));

vi.mock('../../src/components/navigation/SiteHeader', () => ({
  default: () => <header>Site header</header>,
}));

vi.mock('../../src/components/navigation/SiteFooter', () => ({
  default: () => <footer>Site footer</footer>,
}));

const render = async (root: Root, element: React.ReactNode) => {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={['/portal/memorials']}>
        {element}
      </MemoryRouter>,
    );
    await Promise.resolve();
  });
};

describe('MemorialPortalShell', () => {
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

  it('renders a dedicated memorial portal frame without the Writing Studio shell label', async () => {
    await render(root, <MemorialPortalShell><p>Memorial child</p></MemorialPortalShell>);

    expect(container.textContent).toContain('Site header');
    expect(container.textContent).toContain('Memorial Portal');
    expect(container.textContent).toContain('Overview');
    expect(container.textContent).toContain('Memorial child');
    expect(container.textContent).toContain('Site footer');
    expect(container.textContent).not.toContain('Writing Studio');
    expect(container.querySelector('a[href="/portal/memorials"]')).not.toBeNull();
  });

  it('renders the initial memorial portal landing surface', async () => {
    await render(root, <MemorialPortalPage />);

    expect(container.textContent).toContain('Memorial workspace');
    expect(container.textContent).toContain('Page shell');
    expect(container.textContent).toContain('Written content');
    expect(container.textContent).toContain('Structured records');
    expect(container.textContent).toContain('Recordings');
  });
});
