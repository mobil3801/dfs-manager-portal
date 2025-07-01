/**
 * Draft Saving Service for Sales Report Forms
 * Manages local storage of draft reports with expiration
 */

const DRAFT_PREFIX = 'sales-report-draft-';
const DRAFT_EXPIRY_HOURS = 12;

interface DraftData {
  formData: any;
  savedAt: string;
  expiresAt: string;
  station: string;
  reportDate: string;
}

interface DraftInfo {
  savedAt: Date;
  expiresAt: Date;
  timeRemainingHours: number;
}

class DraftSavingService {
  /**
   * Generate a unique key for a draft
   */
  private generateDraftKey(station: string, reportDate: string): string {
    return `${DRAFT_PREFIX}${station}-${reportDate}`;
  }

  /**
   * Save a draft to local storage
   */
  saveDraft(station: string, reportDate: string, formData: any): boolean {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + DRAFT_EXPIRY_HOURS * 60 * 60 * 1000);

      const draftData: DraftData = {
        formData,
        savedAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        station,
        reportDate
      };

      const key = this.generateDraftKey(station, reportDate);
      localStorage.setItem(key, JSON.stringify(draftData));

      console.log(`Draft saved for ${station} on ${reportDate}`);
      return true;
    } catch (error) {
      console.error('Error saving draft:', error);
      return false;
    }
  }

  /**
   * Load a draft from local storage
   */
  loadDraft(station: string, reportDate: string): any | null {
    try {
      const key = this.generateDraftKey(station, reportDate);
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      const draftData: DraftData = JSON.parse(stored);

      // Check if draft has expired
      const now = new Date();
      const expiresAt = new Date(draftData.expiresAt);

      if (now > expiresAt) {
        // Draft has expired, remove it
        this.deleteDraft(station, reportDate);
        return null;
      }

      return draftData.formData;
    } catch (error) {
      console.error('Error loading draft:', error);
      return null;
    }
  }

  /**
   * Delete a draft from local storage
   */
  deleteDraft(station: string, reportDate: string): boolean {
    try {
      const key = this.generateDraftKey(station, reportDate);
      localStorage.removeItem(key);
      console.log(`Draft deleted for ${station} on ${reportDate}`);
      return true;
    } catch (error) {
      console.error('Error deleting draft:', error);
      return false;
    }
  }

  /**
   * Get information about an existing draft
   */
  getDraftInfo(station: string, reportDate: string): DraftInfo | null {
    try {
      const key = this.generateDraftKey(station, reportDate);
      const stored = localStorage.getItem(key);

      if (!stored) {
        return null;
      }

      const draftData: DraftData = JSON.parse(stored);
      const now = new Date();
      const savedAt = new Date(draftData.savedAt);
      const expiresAt = new Date(draftData.expiresAt);

      // Check if draft has expired
      if (now > expiresAt) {
        this.deleteDraft(station, reportDate);
        return null;
      }

      const timeRemainingMs = expiresAt.getTime() - now.getTime();
      const timeRemainingHours = timeRemainingMs / (1000 * 60 * 60);

      return {
        savedAt,
        expiresAt,
        timeRemainingHours
      };
    } catch (error) {
      console.error('Error getting draft info:', error);
      return null;
    }
  }

  /**
   * Get all drafts for all stations
   */
  getAllDrafts(): Array<{station: string;reportDate: string;draftInfo: DraftInfo;}> {
    try {
      const drafts: Array<{station: string;reportDate: string;draftInfo: DraftInfo;}> = [];

      // Iterate through all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(DRAFT_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const draftData: DraftData = JSON.parse(stored);
              const now = new Date();
              const expiresAt = new Date(draftData.expiresAt);

              // Skip expired drafts
              if (now > expiresAt) {
                localStorage.removeItem(key);
                continue;
              }

              const savedAt = new Date(draftData.savedAt);
              const timeRemainingMs = expiresAt.getTime() - now.getTime();
              const timeRemainingHours = timeRemainingMs / (1000 * 60 * 60);

              drafts.push({
                station: draftData.station,
                reportDate: draftData.reportDate,
                draftInfo: {
                  savedAt,
                  expiresAt,
                  timeRemainingHours
                }
              });
            } catch (parseError) {
              console.error('Error parsing draft data:', parseError);
              // Remove corrupted draft
              localStorage.removeItem(key);
            }
          }
        }
      }

      return drafts.sort((a, b) => b.draftInfo.savedAt.getTime() - a.draftInfo.savedAt.getTime());
    } catch (error) {
      console.error('Error getting all drafts:', error);
      return [];
    }
  }

  /**
   * Clean up expired drafts
   */
  cleanupExpiredDrafts(): number {
    try {
      let cleanedCount = 0;
      const now = new Date();

      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);

        if (key && key.startsWith(DRAFT_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const draftData: DraftData = JSON.parse(stored);
              const expiresAt = new Date(draftData.expiresAt);

              if (now > expiresAt) {
                localStorage.removeItem(key);
                cleanedCount++;
              }
            } catch (parseError) {
              // Remove corrupted data
              localStorage.removeItem(key);
              cleanedCount++;
            }
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired drafts`);
      }

      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired drafts:', error);
      return 0;
    }
  }

  /**
   * Check if a draft exists for the given station and date
   */
  hasDraft(station: string, reportDate: string): boolean {
    return this.getDraftInfo(station, reportDate) !== null;
  }

  /**
   * Get draft size information
   */
  getDraftSize(station: string, reportDate: string): number {
    try {
      const key = this.generateDraftKey(station, reportDate);
      const stored = localStorage.getItem(key);
      return stored ? stored.length : 0;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total storage usage for all drafts
   */
  getTotalDraftStorageUsage(): {count: number;totalSize: number;sizeInKB: number;} {
    try {
      let count = 0;
      let totalSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);

        if (key && key.startsWith(DRAFT_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            count++;
            totalSize += stored.length;
          }
        }
      }

      return {
        count,
        totalSize,
        sizeInKB: Math.round(totalSize / 1024 * 100) / 100
      };
    } catch (error) {
      console.error('Error calculating storage usage:', error);
      return { count: 0, totalSize: 0, sizeInKB: 0 };
    }
  }
}

// Export singleton instance
const draftSavingService = new DraftSavingService();

// Auto-cleanup expired drafts on service initialization
draftSavingService.cleanupExpiredDrafts();

export default draftSavingService;