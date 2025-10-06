import type { CustomerInfo } from '../types';

type Suggestion = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  gstin?: string;
  customerType: string;
  city?: string;
  matchReason: string;
};

const customers: CustomerInfo[] = [
  {
    customerId: 'CUST-001',
    customerType: 'Commercial',
    customerName: 'Evanam Pvt Ltd',
    firstName: 'Arun',
    lastName: 'K',
    email: 'contact@evanam.com',
    phoneNumber: '9876543210',
    gstin: '33EVANM1234A1Z5',
    address: '200, Tech Park',
    address2: 'Unit 5B',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    zipCode: '600042',
    siteAddressSameAsCustomer: true,
    siteAddress: '200, Tech Park',
    siteAddress2: 'Unit 5B',
    siteCountry: 'India',
    siteState: 'Tamil Nadu',
    siteCity: 'Chennai',
    siteZipCode: '600042',
    salutation: 'Mr',
    title: 'Contractor'
  },
  {
    customerId: 'CUST-002',
    customerType: 'Individual',
    customerName: 'Vicky',
    firstName: 'Vicky',
    lastName: 'S',
    email: 'vicky@example.com',
    phoneNumber: '9000000001',
    gstin: '',
    address: '45, Gandhi Street',
    address2: '',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    zipCode: '600001',
    siteAddressSameAsCustomer: true,
    siteAddress: '45, Gandhi Street',
    siteAddress2: '',
    siteCountry: 'India',
    siteState: 'Tamil Nadu',
    siteCity: 'Chennai',
    siteZipCode: '600001',
    salutation: 'Mr',
    title: 'Building Owner'
  }
];

export const MockCustomerService = {
  async searchCustomerSuggestions(term: string): Promise<Suggestion[]> {
    const lc = term.toLowerCase();
    const results = customers.filter(c =>
      (c.customerName || '').toLowerCase().includes(lc) ||
      (c.email || '').toLowerCase().includes(lc) ||
      (c.phoneNumber || '').includes(term) ||
      (c.gstin || '').toLowerCase().includes(lc)
    ).map<Suggestion>((c) => ({
      id: c.customerId || c.customerName || Math.random().toString(36).slice(2),
      name: c.customerName || `${c.firstName} ${c.lastName}`.trim(),
      email: c.email,
      phone: c.phoneNumber,
      gstin: c.gstin,
      customerType: c.customerType || 'Individual',
      city: c.city,
      matchReason: 'Mock match'
    }));

    await new Promise(r => setTimeout(r, 200));
    return results;
  },

  async getCustomerById(id: string): Promise<CustomerInfo | null> {
    await new Promise(r => setTimeout(r, 150));
    return customers.find(c => c.customerId === id) || null;
  },

  async searchCustomer(term: string, _searchType: 'email' | 'mobile' | 'name' | 'gstin'): Promise<CustomerInfo | null> {
    const sugg = await this.searchCustomerSuggestions(term);
    if (sugg.length === 0) return null;
    return this.getCustomerById(sugg[0].id);
  },

  async lookupGSTIN(gstin: string): Promise<any> {
    // Provide a consistent GSTIN response shape used in UI helper
    await new Promise(r => setTimeout(r, 250));
    return {
      gstin,
      business_name: 'Mock GST Business',
      data: [
        {
          name: 'Mock GST Business',
          address_title: 'Registered Office',
          address_line1: '200, Tech Park',
          address_line2: 'Unit 5B',
          city: 'Chennai',
          state: 'Tamil Nadu',
          pincode: '600042',
          country: 'India'
        }
      ]
    };
  }
};


