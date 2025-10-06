import type { CustomerInfo } from '../../types';
import { frappeAPI } from '../../api/frappe';

export type CustomerSuggestion = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  customerType: string;
  city?: string;
  matchReason: string;
};

export const CustomerService = {
  async searchCustomerSuggestions(term: string): Promise<CustomerSuggestion[]> {
    try {
      // Use Frappe API to search customers
      const customers = await frappeAPI.getDocTypeList<CustomerInfo>(
        'Customer',
        [['customer_name', 'like', `%${term}%`]],
        ['name', 'customer_name', 'customer_type', 'email_id', 'mobile_no', 'gstin', 'city']
      );

      return customers.map<CustomerSuggestion>((c) => ({
        id: c.customerId || c.customerName || Math.random().toString(36).slice(2),
        name: c.customerName || `${c.firstName} ${c.lastName}`.trim(),
        email: c.email,
        phone: c.phoneNumber,
        gstin: c.gstin,
        customerType: c.customerType || 'Individual',
        city: c.city,
        matchReason: 'Database match'
      }));
    } catch (error) {
      console.error('Error searching customer suggestions:', error);
      return [];
    }
  },

  async getCustomerById(id: string): Promise<CustomerInfo | null> {
    try {
      const customer = await frappeAPI.getDocType<CustomerInfo>('Customer', id);
      return customer;
    } catch (error) {
      console.error('Error fetching customer by ID:', error);
      return null;
    }
  },

  async searchCustomer(term: string, searchType: 'email' | 'mobile' | 'name' | 'gstin'): Promise<CustomerInfo | null> {
    try {
      let filters: string[][] = [];
      
      switch (searchType) {
        case 'email':
          filters = [['email_id', 'like', `%${term}%`]];
          break;
        case 'mobile':
          filters = [['mobile_no', 'like', `%${term}%`]];
          break;
        case 'name':
          filters = [['customer_name', 'like', `%${term}%`]];
          break;
        case 'gstin':
          filters = [['gstin', 'like', `%${term}%`]];
          break;
      }

      const customers = await frappeAPI.getDocTypeList<CustomerInfo>(
        'Customer',
        filters,
        ['*']
      );

      return customers.length > 0 ? customers[0] : null;
    } catch (error) {
      console.error('Error searching customer:', error);
      return null;
    }
  },

  async lookupGSTIN(gstin: string): Promise<any> {
    try {
      // This would typically call an external GSTIN validation API
      // For now, return a mock response structure
      return {
        gstin,
        business_name: 'GST Business',
        data: [
          {
            name: 'GST Business',
            address_title: 'Registered Office',
            address_line1: 'Business Address',
            address_line2: '',
            city: 'City',
            state: 'State',
            pincode: '000000',
            country: 'India'
          }
        ]
      };
    } catch (error) {
      console.error('Error looking up GSTIN:', error);
      return null;
    }
  }
};
