import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { TopMetricCards } from '../components/TopMetricCards';
import { SettingsModal } from '../components/SettingsModal';
import { DELHI_NCR_STATIONS, GRAP_STAGE_DATA } from '../data/mockData';

describe('Core Dashboard Components & Interactive Accessibility', () => {
  it('renders Sidebar navigation landmark and triggers tab selection', () => {
    const onSelectTab = vi.fn();
    const onOpenSettings = vi.fn();
    render(
      <Sidebar
        currentTab="dashboard"
        onSelectTab={onSelectTab}
        activeStage={GRAP_STAGE_DATA.roman}
        onOpenSettings={onOpenSettings}
      />
    );
    expect(screen.getByRole('navigation', { name: /primary navigation/i })).toBeInTheDocument();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(3);
    fireEvent.click(buttons[1]);
    expect(onSelectTab).toHaveBeenCalled();
  });

  it('renders Header banner with station context and modal triggers', () => {
    const onSelectStation = vi.fn();
    const onOpenAiReasoning = vi.fn();
    const onOpenGrapModal = vi.fn();
    const onOpenSettings = vi.fn();
    const onOpenMobileAlerts = vi.fn();
    render(
      <Header
        selectedStation={DELHI_NCR_STATIONS[0]}
        stations={DELHI_NCR_STATIONS}
        onSelectStation={onSelectStation}
        onOpenAiReasoning={onOpenAiReasoning}
        onOpenGrapModal={onOpenGrapModal}
        onOpenSettings={onOpenSettings}
        onOpenMobileAlerts={onOpenMobileAlerts}
      />
    );
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('renders TopMetricCards with real station AQI data', () => {
    render(
      <TopMetricCards
        station={DELHI_NCR_STATIONS[0]}
        stations={DELHI_NCR_STATIONS}
        onOpenStationDetail={vi.fn()}
      />
    );
    expect(screen.getByText(String(DELHI_NCR_STATIONS[0].aqi))).toBeInTheDocument();
  });

  it('provides an explicit aria-label on the modal close button', () => {
    const onClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={onClose} />);
    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
