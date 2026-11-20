import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsModal } from '../components/SettingsModal';
import { GrapGuidelinesModal } from '../components/GrapGuidelinesModal';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { GRAP_STAGE_DATA } from '../data/mockData';

describe('Accessibility & Resilience Checks (WCAG 2.1 AA)', () => {
  it('renders SettingsModal with dialog semantics and closes on Escape', () => {
    const onClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={onClose} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders GrapGuidelinesModal with dialog semantics and closes on Escape', () => {
    const onClose = vi.fn();
    render(<GrapGuidelinesModal isOpen={true} onClose={onClose} grapStage={GRAP_STAGE_DATA} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders an accessible alert fallback when ErrorBoundary catches a crash', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const BrokenChild = () => {
      throw new Error('Telemetry sensor offline');
    };
    render(
      <ErrorBoundary>
        <BrokenChild />
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Telemetry sensor offline');
    expect(screen.getByRole('button', { name: /retry view/i })).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
