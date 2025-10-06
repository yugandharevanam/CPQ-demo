// File: src/hooks/useFrappeData.ts
import useSWR from 'swr';
import { frappeAPI } from '../../api/frappe';

export function useDocTypeList<T>(docType: string, filters: string[][] = [], fields: [string] = ['*']) {
  const fetcher = () => frappeAPI.getDocTypeList<T>(docType, filters, fields);
  
  const { data, error, isLoading, mutate } = useSWR(
    docType ? `doctype/${docType}/list` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

export function useDocType<T>(docType: string, name: string) {
  const fetcher = () => frappeAPI.getDocType<T>(docType, name);
  
  const { data, error, isLoading, mutate } = useSWR(
    docType && name ? `doctype/${docType}/${name}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
  
  return {
    data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// TODO: CPQ should not create/update/delete doctypes. Can be a future scope of work
// export function useCreateDocType<T>() {
//   const createDocType = async (docType: string, data: any) => {
//     try {
//       const result = await frappeAPI.createDocType<T>(docType, data);
//       return result;
//     } catch (error) {
//       throw error;
//     }
//   };
  
//   return { createDocType };
// }

// export function useUpdateDocType<T>() {
//   const updateDocType = async (docType: string, name: string, data: any) => {
//     try {
//       const result = await frappeAPI.updateDocType<T>(docType, name, data);
//       return result;
//     } catch (error) {
//       throw error;
//     }
//   };
  
//   return { updateDocType };
// }

// export function useDeleteDocType() {
//   const deleteDocType = async (docType: string, name: string) => {
//     try {
//       await frappeAPI.deleteDocType(docType, name);
//       return true;
//     } catch (error) {
//       throw error;
//     }
//   };
  
//   return { deleteDocType };
// }
