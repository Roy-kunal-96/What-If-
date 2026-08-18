/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FinancialProfile,
  FinancialAssumptions,
  ScenarioDefinition,
  SavedScenario,
  NavTab,
  ThemeId,
} from './types';
import { DEFAULT_PROFILE, DEFAULT_ASSUMPTIONS } from './engine/projection';
import { SCENARIO_CATALOG } from './engine/scenarios';
import { applyThemeToDocument, THEMES } from './utils/theme';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ScenariosView } from './components/ScenariosView';
import { ScenarioBuilderView } from './components/ScenarioBuilderView';
import { ReverseWhatIfView } from './components/ReverseWhatIfView';
import { LifeShockView } from './components/LifeShockView';
import { GoalsView } from './components/GoalsView';
import { PortfolioView } from './components/PortfolioView';
import { TimelineView } from './components/TimelineView';
import { InsightsView } from './components/InsightsView';
import { ScenarioModal } from './components/ScenarioModal';
import { CustomScenarioModal } from './components/CustomScenarioModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Theme State
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('whatif_selected_theme') as ThemeId;
      return (saved && THEMES[saved]) ? saved : 'indigo';
    } catch {
      return 'indigo';
    }
  });

  // Apply theme to document when changed
  useEffect(() => {
    applyThemeToDocument(currentTheme);
  }, [currentTheme]);

  // Financial Profile State
  const [profile, setProfile] = useState<FinancialProfile>(() => {
    try {
      const saved = localStorage.getItem('whatif_profile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  // Simulation Assumptions
  const [assumptions, setAssumptions] = useState<FinancialAssumptions>(() => {
    try {
      const saved = localStorage.getItem('whatif_assumptions');
      return saved ? JSON.parse(saved) : DEFAULT_ASSUMPTIONS;
    } catch {
      return DEFAULT_ASSUMPTIONS;
    }
  });

  // Stacked Scenarios State
  const [stackedScenarios, setStackedScenarios] = useState<ScenarioDefinition[]>([]);

  // Active Scenario Builder State
  const [activeBuildingScenario, setActiveBuildingScenario] = useState<ScenarioDefinition | null>(null);

  // Modals
  const [isWhatIfModalOpen, setIsWhatIfModalOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Saved Scenarios History
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>(() => {
    try {
      const saved = localStorage.getItem('whatif_saved_history');
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: 'saved-1',
              definitionId: 'sc-inc-sip-10k',
              name: 'SIP Boost +₹15,000/mo',
              description: 'Step up investment by ₹15K every month',
              parameters: { sipIncrease: 15000 },
              impactWealth50Delta: 6800000,
              impactFiAgeDelta: -2,
              createdAt: 'Today',
            },
            {
              id: 'saved-2',
              definitionId: 'sc-buy-house-80l',
              name: 'Dream Home ₹80L Property',
              description: '20% down payment with ₹64L home loan',
              parameters: { propertyPrice: 8000000, downPaymentPct: 0.2 },
              impactWealth50Delta: -11200000,
              impactFiAgeDelta: 4,
              createdAt: 'Yesterday',
            },
          ];
    } catch {
      return [];
    }
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('whatif_profile', JSON.stringify(profile));
    } catch (e) {}
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem('whatif_assumptions', JSON.stringify(assumptions));
    } catch (e) {}
  }, [assumptions]);

  useEffect(() => {
    try {
      localStorage.setItem('whatif_saved_history', JSON.stringify(savedScenarios));
    } catch (e) {}
  }, [savedScenarios]);

  // Handlers
  const handleSelectScenario = (scenario: ScenarioDefinition) => {
    setActiveBuildingScenario(scenario);
    setIsWhatIfModalOpen(false);
  };

  const handleApplyScenarioToStack = (scenario: ScenarioDefinition) => {
    if (!stackedScenarios.some((s) => s.id === scenario.id)) {
      setStackedScenarios([...stackedScenarios, scenario]);
    } else {
      setStackedScenarios(
        stackedScenarios.map((s) => (s.id === scenario.id ? scenario : s))
      );
    }
    setActiveBuildingScenario(null);
  };

  const handleSaveScenarioToHistory = (
    scenario: ScenarioDefinition,
    wealthDelta: number,
    fiDelta: number
  ) => {
    const newSaved: SavedScenario = {
      id: `saved-${Date.now()}`,
      definitionId: scenario.id,
      name: scenario.title,
      description: scenario.subtitle,
      parameters: { ...scenario.parameters },
      impactWealth50Delta: wealthDelta,
      impactFiAgeDelta: fiDelta,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      }),
    };
    setSavedScenarios([newSaved, ...savedScenarios]);
  };

  const handleDeleteSavedScenario = (id: string) => {
    setSavedScenarios(savedScenarios.filter((s) => s.id !== id));
  };

  const handleCreateCustomScenario = (scenario: ScenarioDefinition) => {
    setActiveBuildingScenario(scenario);
  };

  const activeThemeConfig = THEMES[currentTheme] || THEMES.indigo;

  return (
    <div className={`min-h-screen ${activeThemeConfig.bgClass} flex flex-col md:flex-row antialiased font-sans transition-colors duration-200`}>
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveBuildingScenario(null);
        }}
        onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        profile={profile}
        activeScenarioCount={stackedScenarios.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          profile={profile}
          activeScenarioCount={stackedScenarios.length}
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
          onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
          onResetAllScenarios={() => setStackedScenarios([])}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Dynamic Route/View Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {/* If actively editing/simulating a single scenario */}
          {activeBuildingScenario ? (
            <ScenarioBuilderView
              scenario={activeBuildingScenario}
              profile={profile}
              assumptions={assumptions}
              primaryHex={activeThemeConfig.primaryHex}
              onBack={() => setActiveBuildingScenario(null)}
              onApplyToStack={handleApplyScenarioToStack}
              onSaveToHistory={handleSaveScenarioToHistory}
            />
          ) : (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  profile={profile}
                  assumptions={assumptions}
                  activeScenarios={stackedScenarios}
                  primaryHex={activeThemeConfig.primaryHex}
                  onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
                  onSelectScenario={handleSelectScenario}
                  onNavigateToTab={(tab) => setCurrentTab(tab)}
                  onRemoveScenario={(id) =>
                    setStackedScenarios(stackedScenarios.filter((s) => s.id !== id))
                  }
                />
              )}

              {currentTab === 'scenarios' && (
                <ScenariosView
                  profile={profile}
                  assumptions={assumptions}
                  stackedScenarios={stackedScenarios}
                  savedScenarios={savedScenarios}
                  onSelectScenario={handleSelectScenario}
                  onUpdateStack={setStackedScenarios}
                  onDeleteSavedScenario={handleDeleteSavedScenario}
                  onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
                  onCreateCustom={() => setIsCustomModalOpen(true)}
                />
              )}

              {currentTab === 'reverse' && (
                <ReverseWhatIfView
                  profile={profile}
                  assumptions={assumptions}
                />
              )}

              {currentTab === 'shock' && (
                <LifeShockView
                  profile={profile}
                  assumptions={assumptions}
                  onSimulateShock={(shock) => {
                    const sc = SCENARIO_CATALOG.find((s) => s.id === 'sc-career-break-2yr');
                    if (sc) handleSelectScenario(sc);
                  }}
                />
              )}

              {currentTab === 'goals' && (
                <GoalsView
                  profile={profile}
                  assumptions={assumptions}
                  onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
                />
              )}

              {currentTab === 'portfolio' && (
                <PortfolioView
                  profile={profile}
                  assumptions={assumptions}
                />
              )}

              {currentTab === 'timeline' && (
                <TimelineView
                  profile={profile}
                  assumptions={assumptions}
                  activeScenarios={stackedScenarios}
                  onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
                />
              )}

              {currentTab === 'insights' && (
                <InsightsView
                  profile={profile}
                  assumptions={assumptions}
                  onOpenWhatIf={() => setIsWhatIfModalOpen(true)}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setActiveBuildingScenario(null);
        }}
        onOpenWhatIfModal={() => setIsWhatIfModalOpen(true)}
      />

      {/* Primary What If Scenario Discovery Modal */}
      <ScenarioModal
        isOpen={isWhatIfModalOpen}
        onClose={() => setIsWhatIfModalOpen(false)}
        onSelectScenario={handleSelectScenario}
        onCreateCustom={() => {
          setIsWhatIfModalOpen(false);
          setIsCustomModalOpen(true);
        }}
      />

      {/* Custom Scenario Builder Modal */}
      <CustomScenarioModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onCreateScenario={handleCreateCustomScenario}
        userAge={profile.age}
      />

      {/* Profile & Simulation Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        profile={profile}
        assumptions={assumptions}
        onSaveProfile={setProfile}
        onSaveAssumptions={setAssumptions}
      />
    </div>
  );
}
