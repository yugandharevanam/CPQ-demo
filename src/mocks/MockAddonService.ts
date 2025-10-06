import { Addon } from '../types';

// Using user-provided dataset, images omitted as requested
const rawAddons = [
  { id: 'CASC-AC-01', name: 'Air Conditioning System', category: 'Comfort', description: null },
  { id: 'CASC-HANDRAIL-01', name: 'Straight Handrail', category: 'Comfort', description: null },
  { id: 'CASC-HANDRAIL-02', name: 'Curved Handrail', category: 'Comfort', description: 'Curved Flat Handrail for Comfort and Support.\nElegant and Sleek' },
  { id: 'DASC-MIRROR-01', name: 'Full Mirror (Rear)', category: 'Design', description: 'Full-length mirror for the elevator cabin.' },
  { id: 'DASC-MIRROR-02', name: 'Half Mirror (Rear)', category: 'Design', description: null },
  { id: 'DASC-TFTTOUCH-01', name: 'TFT Touch Screen', category: 'Design', description: null },
  { id: 'DASC-TOUCH-01', name: 'Touch LOP/COP', category: 'Design', description: null },
  { id: 'SASC-ACCESSCARD-01', name: 'RFID Access Card System', category: 'Security', description: null },
  { id: 'SASC-BIOMETRIC-01', name: 'Biometric Access System', category: 'Security', description: null },
  { id: 'SASC-INTERCOM-01', name: '2 Way Intercom', category: 'Security', description: null }
];

// Assign default prices (0) and empty image field
const addons: Addon[] = rawAddons.map(a => ({
  id: a.id,
  name: a.name,
  category: a.category,
  description: a.description || '',
  image: '',
  price: 0
}));

export const MockAddonService = {
  async getAddons(): Promise<Addon[]> {
    await new Promise(r => setTimeout(r, 100));
    return addons;
  }
};


