import { Product } from '../types';

const mockProducts: Product[] = [
  {
    id: 'ITEM-MODEL-6P',
    name: 'Evanam Series 6 Passenger',
    description: 'Reliable residential lift, 6 passenger capacity.',
    image: '/placeholder-product.jpg',
    price: 950000,
    capacity: 6,
    additionalFloorCost: 55000,
    features: ['IoT Connected', 'Energy Efficient', 'Reliable'],
    maxStops: 21,
    maxSpeed: '1.0 m/s',
    recommendedBuildingTypes: ['Residential', 'Commercial']
  },
  {
    id: 'ITEM-MODEL-8P',
    name: 'Evanam Series 8 Passenger',
    description: 'Premium finish, 8 passenger capacity.',
    image: '/placeholder-product.jpg',
    price: 1250000,
    capacity: 8,
    additionalFloorCost: 65000,
    features: ['IoT Connected', 'Energy Efficient', 'Premium Finish'],
    maxStops: 24,
    maxSpeed: '1.5 m/s',
    recommendedBuildingTypes: ['Residential', 'Commercial', 'Office']
  }
];

export const MockProductService = {
  async getProducts(passengerCapacity?: number): Promise<Product[]> {
    await new Promise(r => setTimeout(r, 150));
    if (!passengerCapacity) return mockProducts;
    return mockProducts.filter(p => p.capacity === passengerCapacity);
  },

  async getProductById(productId: string): Promise<Product | null> {
    await new Promise(r => setTimeout(r, 100));
    return mockProducts.find(p => p.id === productId) || null;
  }
};


