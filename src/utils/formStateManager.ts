// import { FormData } from '../types'; // Not used after cleanup

const FORM_DATA_KEY = 'cpq_form_data';
const CURRENT_STEP_KEY = 'cpq_current_step';
const BACKUP_PREFIX = 'cpq_form_backup_';

export const formStateManager = {
  /**
   * Save form data to localStorage
   */
  saveFormData: (data: any) => {
    try {
      localStorage.setItem(FORM_DATA_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch {
      // Silent error handling
    }
  },

  /**
   * Load form data from localStorage
   */
  loadFormData: () => {
    try {
      const stored = localStorage.getItem(FORM_DATA_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.data;
      }
    } catch {
      // Silent error handling
    }
    return null;
  },

  /**
   * Save current step to localStorage
   */
  saveCurrentStep: (step: number) => {
    try {
      localStorage.setItem(CURRENT_STEP_KEY, step.toString());
    } catch {
      // Silent error handling
    }
  },

  /**
   * Load current step from localStorage
   */
  loadCurrentStep: (): number => {
    try {
      const stored = localStorage.getItem(CURRENT_STEP_KEY);
      if (stored) {
        const step = parseInt(stored, 10);
        return isNaN(step) ? 1 : step;
      }
    } catch {
      // Silent error handling
    }
    return 1;
  },

  /**
   * Clear all form data from localStorage
   */
  clearFormData: () => {
    try {
      localStorage.removeItem(FORM_DATA_KEY);
      localStorage.removeItem(CURRENT_STEP_KEY);
    } catch {
      // Silent error handling
    }
  },

  /**
   * Check if there's saved form data
   */
  hasSavedData: (): boolean => {
    const data = formStateManager.loadFormData();
    return data !== null && (
      (data.productConfigs && data.productConfigs.length > 0) ||
      (data.customerInfo && data.customerInfo.firstName)
    );
  },

  /**
   * Auto-save with debounce
   */
  autoSave: (() => {
    let timeoutId: NodeJS.Timeout;
    return (data: any) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        formStateManager.saveFormData(data);
      }, 2000); // 2 second debounce to reduce excessive saves during typing
    };
  })(),

  /**
   * Create a backup of current form data
   */
  createBackup: (label?: string) => {
    try {
      const currentData = formStateManager.loadFormData();
      if (currentData) {
        const backupKey = `${BACKUP_PREFIX}${Date.now()}_${label || 'auto'}`;
        localStorage.setItem(backupKey, JSON.stringify({
          data: currentData,
          timestamp: Date.now(),
          label: label || 'Auto backup'
        }));
      }
    } catch {
      // Silent error handling
    }
  },

  /**
   * Get available backups
   */
  getAvailableBackups: () => {
    try {
      const backups = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(BACKUP_PREFIX)) {
          const backup = JSON.parse(localStorage.getItem(key) || '{}');
          backups.push({
            key,
            ...backup
          });
        }
      }
      return backups.sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      // Silent error handling
      return [];
    }
  },

  /**
   * Restore from backup
   */
  restoreFromBackup: (backupKey: string) => {
    try {
      const backup = localStorage.getItem(backupKey);
      if (backup) {
        const parsed = JSON.parse(backup);
        formStateManager.saveFormData(parsed.data);
        return parsed.data;
      }
    } catch {
      // Silent error handling
    }
    return null;
  }
};

/**
 * Hook for managing form state persistence
 */
export const useFormStateManager = () => {
  return {
    saveFormData: formStateManager.saveFormData,
    loadFormData: formStateManager.loadFormData,
    saveCurrentStep: formStateManager.saveCurrentStep,
    loadCurrentStep: formStateManager.loadCurrentStep,
    clearFormData: formStateManager.clearFormData,
    hasSavedData: formStateManager.hasSavedData,
    autoSave: formStateManager.autoSave,
    createBackup: formStateManager.createBackup,
    getAvailableBackups: formStateManager.getAvailableBackups,
    restoreFromBackup: formStateManager.restoreFromBackup
  };
}; 