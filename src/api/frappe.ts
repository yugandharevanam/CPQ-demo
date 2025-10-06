// api/frappe.ts
import axiosInstance from './axiosInstance';
import { handleApiError } from '../utils/errorHandler';

/**
 * Enhanced Frappe API client
 * Provides type-safe methods for interacting with the Frappe API
 * Includes consistent error handling
 */
export const frappeAPI = {
  /**
   * Get a list of documents from a DocType
   * @param docType The DocType to fetch
   * @param filters Optional filters to apply
   * @param fields Optional fields to include
   * @returns Array of documents
   */
  getDocTypeList: async <T>(
    docType: string,
    filters: string[][] = [],
    fields: string[] = ['*'],
    orderBy: string = '',
    limit: number = 50
  ): Promise<T[]> => {
    try {
      const params = new URLSearchParams();

      if (filters && filters.length > 0) {
        // Convert filters to the format Frappe expects
        params.append('filters', JSON.stringify(filters));
      }

      if (fields && fields.length > 0) {
        // Only request the fields we need - better performance
        params.append('fields', JSON.stringify(fields));
      }

      if (orderBy != '') {
        params.append('order_by', orderBy);
      }

      if (limit) {
        params.append('limit', limit.toString());
      }

      const response = await axiosInstance.get(
        `/api/resource/${docType}`,
        { params }
      );

      return response.data.data as T[];
    } catch (error) {
      return handleApiError(error, `Failed to fetch ${docType} list`, []);
    }
  },

  /**
   * Get a single document from a DocType
   * @param docType The DocType to fetch
   * @param name The document name/ID
   * @param fields Optional fields to include
   * @returns The document or null if not found
   */
  getDocType: async <T>(
    docType: string,
    name: string,
    fields: string[] = ['*']
  ): Promise<T | null> => {
    try {
      const params = new URLSearchParams();

      if (fields && fields.length > 0 && !fields.includes('*')) {
        // Only request the fields we need - better performance
        params.append('fields', JSON.stringify(fields));
      }

      const response = await axiosInstance.get(
        `/api/resource/${docType}/${name}`,
        { params }
      );
      return response.data.data as T;
    } catch (error: unknown) {
      // For 404 errors, return null instead of throwing
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { status: number } };
        if (axiosError.response?.status === 404) {
        return null;
        }
      }

      return handleApiError(error, `Failed to fetch ${docType} ${name}`, null);
    }
  },

  /**
   * Create a new document in a DocType
   * @param docType The DocType to create
   * @param data The document data
   * @returns The created document
   */
  createDocType: async <T>(docType: string, data: Record<string, unknown>): Promise<T> => {
    try {
      const response = await axiosInstance.post(
        `/api/resource/${docType}`,
        { data }
      );

      return response.data.data as T;
    } catch (error) {
      return handleApiError(error, `Failed to create ${docType}`);
    }
  },

  /**
   * Update an existing document in a DocType
   * @param docType The DocType to update
   * @param name The document name/ID
   * @param data The document data
   * @returns The updated document
   */
  updateDocType: async <T>(docType: string, name: string, data: Record<string, unknown>): Promise<T> => {
    try {
      const response = await axiosInstance.put(
        `/api/resource/${docType}/${name}`,
        { data }
      );

      return response.data.data as T;
    } catch (error) {
      return handleApiError(error, `Failed to update ${docType} ${name}`);
    }
  },

  /**
   * Delete a document from a DocType
   * @param docType The DocType to delete from
   * @param name The document name/ID
   * @returns True if successful
   */
  deleteDocType: async (docType: string, name: string): Promise<boolean> => {
    try {
      await axiosInstance.delete(`/api/resource/${docType}/${name}`);
      return true;
    } catch (error) {
      return handleApiError(error, `Failed to delete ${docType} ${name}`);
    }
  },
};

export default frappeAPI;