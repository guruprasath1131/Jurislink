import { CourtCase } from '../types';

/**
 * Jurislink Offline-First Storage & Caching Layer
 * Provides persistent local caching with "Last Synced" timestamps and network awareness.
 */

export interface CachedCaseRecord {
  caseData: CourtCase;
  savedAt: string; // ISO date
  lastSyncedAt: string;
  isPinned: boolean;
  notes?: string;
}

export class StorageService {
  private static STORAGE_KEY = 'jurislink_saved_cases_v1';

  static getSavedCases(): CachedCaseRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static saveCase(caseData: CourtCase, isPinned: boolean = false): void {
    if (typeof window === 'undefined') return;
    const all = this.getSavedCases().filter(c => c.caseData.cnr !== caseData.cnr);
    all.unshift({
      caseData,
      savedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      isPinned
    });
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  static removeCase(cnr: string): void {
    if (typeof window === 'undefined') return;
    const all = this.getSavedCases().filter(c => c.caseData.cnr !== cnr);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
  }

  static isCaseSaved(cnr: string): boolean {
    return this.getSavedCases().some(c => c.caseData.cnr === cnr);
  }

  static getCase(cnr: string): CourtCase | null {
    const found = this.getSavedCases().find(c => c.caseData.cnr === cnr);
    return found ? found.caseData : null;
  }
}
