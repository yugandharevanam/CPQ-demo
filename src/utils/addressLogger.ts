// utils/addressLogger.ts
// Utility for monitoring and debugging address mapping issues

export interface AddressMappingLog {
  customerId: string;
  customerName: string;
  source: 'customer_search' | 'gstin_lookup';
  strategy?: string;
  originalData: Record<string, unknown>;
  mappedData: Record<string, unknown>;
  cityFound: boolean;
  timestamp: Date;
}

class AddressLogger {
  private logs: AddressMappingLog[] = [];
  private maxLogs = 50; // Keep last 50 logs

  /**
   * Log address mapping attempt
   */
  logMapping(data: Omit<AddressMappingLog, 'timestamp'>): void {
    const log: AddressMappingLog = {
      ...data,
      timestamp: new Date()
    };

    this.logs.push(log);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console for debugging
    if (!data.cityFound) {
      console.warn('🚨 City mapping failed:', {
        customer: data.customerName,
        source: data.source,
        strategy: data.strategy,
        originalData: data.originalData
      });
    } else {
      console.log('✅ City mapping successful:', {
        customer: data.customerName,
        city: data.mappedData.city,
        source: data.source,
        strategy: data.strategy
      });
    }
  }

  /**
   * Get recent mapping failures
   */
  getFailures(): AddressMappingLog[] {
    return this.logs.filter(log => !log.cityFound);
  }

  /**
   * Get mapping statistics
   */
  getStats(): {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    bySource: Record<string, { successful: number; failed: number }>;
  } {
    const total = this.logs.length;
    const successful = this.logs.filter(log => log.cityFound).length;
    const failed = total - successful;
    
    const bySource: Record<string, { successful: number; failed: number }> = {};
    
    this.logs.forEach(log => {
      if (!bySource[log.source]) {
        bySource[log.source] = { successful: 0, failed: 0 };
      }
      
      if (log.cityFound) {
        bySource[log.source].successful++;
      } else {
        bySource[log.source].failed++;
      }
    });

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? (successful / total) * 100 : 0,
      bySource
    };
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Export singleton instance
export const addressLogger = new AddressLogger();

// Helper function to extract city validation info
export const validateCityMapping = (customer: Record<string, any>, source: 'customer_search' | 'gstin_lookup', strategy?: string): boolean => {  
  const hasCity = !!(customer.city && customer.city.trim().length > 0);
  
  addressLogger.logMapping({
    customerId: customer.customerId || customer.id || 'unknown',
    customerName: customer.customerName || customer.name || 'unknown',
    source,
    strategy,
    originalData: customer,
    mappedData: {
      city: customer.city,
      state: customer.state,
      address: customer.address
    },
    cityFound: hasCity
  });
  
  return hasCity;
};

// Helper function specifically for monitoring dropdown synchronization
export const logDropdownSync = (customerId: string, customerName: string, data: {
  stateSet: string;
  citySet: string;
  citiesLoaded: number;
  cityFoundInList: boolean;
  action: 'initial_load' | 'state_change' | 'validation_check';
}): void => {
  console.log('🔄 City Dropdown Sync:', {
    customer: `${customerName} (${customerId})`,
    state: data.stateSet,
    city: data.citySet,
    citiesAvailable: data.citiesLoaded,
    cityInList: data.cityFoundInList,
    action: data.action,
    timestamp: new Date().toISOString()
  });
  
  if (!data.cityFoundInList && data.citySet && data.citiesLoaded > 0) {
    console.warn('⚠️ City not found in dropdown list:', {
      city: data.citySet,
      state: data.stateSet,
      availableCities: data.citiesLoaded
    });
  }
}; 