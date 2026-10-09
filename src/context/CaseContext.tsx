import React, { createContext, useContext, useState, useEffect } from 'react';
import { CourtCase, DemoScenarioId, DemoScenario } from '../types';
import { courtDataProvider, DEMO_CASES, DEMO_SCENARIO_METADATA } from '../services/courtDataProvider';
import { StorageService, CachedCaseRecord } from '../services/storageService';
import { BackendApiService } from '../services/backendApi';

interface CaseContextType {
  activeCase: CourtCase | null;
  setActiveCase: (c: CourtCase | null) => void;
  savedCases: CachedCaseRecord[];
  refreshSavedCases: () => void;
  saveCase: (c: CourtCase) => void;
  removeCase: (cnr: string) => void;
  isSaved: (cnr: string) => boolean;
  
  // Demo Mode
  activeDemoScenarioId: DemoScenarioId;
  switchDemoScenario: (id: DemoScenarioId) => Promise<void>;
  demoScenarios: DemoScenario[];
  
  // Lookup
  lookupCnr: (cnr: string) => Promise<CourtCase | null>;
  searchCases: (query: { court?: string; caseNumber?: string; partyName?: string }) => Promise<CourtCase[]>;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeCase, setActiveCase] = useState<CourtCase | null>(DEMO_CASES.upcoming_hearing);
  const [activeDemoScenarioId, setActiveDemoScenarioId] = useState<DemoScenarioId>('upcoming_hearing');
  const [savedCases, setSavedCases] = useState<CachedCaseRecord[]>([]);
  const [demoScenarios, setDemoScenarios] = useState<DemoScenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSavedCases = () => {
    const list = StorageService.getSavedCases();
    // If empty initially, populate with the first demo case for ready-to-test experience
    if (list.length === 0) {
      StorageService.saveCase(DEMO_CASES.upcoming_hearing, true);
      setSavedCases(StorageService.getSavedCases());
    } else {
      setSavedCases(list);
    }
  };

  useEffect(() => {
    refreshSavedCases();
    courtDataProvider.getAllDemoScenarios().then(setDemoScenarios);
  }, []);

  const saveCase = (c: CourtCase) => {
    StorageService.saveCase(c);
    refreshSavedCases();
  };

  const removeCase = (cnr: string) => {
    StorageService.removeCase(cnr);
    refreshSavedCases();
  };

  const isSaved = (cnr: string) => {
    return StorageService.isCaseSaved(cnr);
  };

  const switchDemoScenario = async (id: DemoScenarioId) => {
    setIsLoading(true);
    setError(null);
    try {
      setActiveDemoScenarioId(id);
      const scenario = await courtDataProvider.getDemoScenario(id);
      if (scenario) {
        setActiveCase(scenario.caseData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const lookupCnr = async (cnr: string): Promise<CourtCase | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await BackendApiService.getCaseByCnr(cnr);
      if (result) {
        setActiveCase(result);
        return result;
      } else {
        setError(`No case found for CNR: ${cnr}. Please check the number or scan notice.`);
        return null;
      }
    } catch (e: any) {
      setError(e.message || 'Failed to lookup case');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const searchCases = async (query: { court?: string; caseNumber?: string; partyName?: string }): Promise<CourtCase[]> => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await BackendApiService.searchCases(query);
      if (results.length > 0) {
        setActiveCase(results[0]);
      } else {
        setError('No cases found matching your search query.');
      }
      return results;
    } catch (e: any) {
      setError(e.message || 'Search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <CaseContext.Provider value={{
      activeCase,
      setActiveCase,
      savedCases,
      refreshSavedCases,
      saveCase,
      removeCase,
      isSaved,
      activeDemoScenarioId,
      switchDemoScenario,
      demoScenarios,
      lookupCnr,
      searchCases,
      isLoading,
      error,
      clearError
    }}>
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = (): CaseContextType => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
};
