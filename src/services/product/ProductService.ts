import { Product } from '../../types';
import { frappeAPI } from '../../api/frappe';

export const ProductService = {
  async getProducts(passengerCapacity?: number): Promise<Product[]> {
    try {
      let filters: string[][] = [];
      
      if (passengerCapacity) {
        filters = [['capacity', '=', passengerCapacity.toString()]];
      }

      const products = await frappeAPI.getDocTypeList<Product>(
        'Item',
        filters,
        ['name', 'item_name', 'description', 'standard_rate', 'capacity', 'additional_floor_cost', 'features', 'max_stops', 'max_speed', 'recommended_building_types']
      );

      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getProductById(productId: string): Promise<Product | null> {
    try {
      const product = await frappeAPI.getDocType<Product>('Item', productId);
      return product;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }
};
