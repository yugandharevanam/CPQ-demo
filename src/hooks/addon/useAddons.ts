import { useState, useEffect } from 'react';
import { Addon } from '../../types';
import { MockAddonService } from '../../mocks/MockAddonService';

export const useAddons = () => {
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddons = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await MockAddonService.getAddons();
        setAddons(data);
              } catch {
          setError('Failed to fetch addons');
        } finally {
        setLoading(false);
      }
    };
    fetchAddons();
  }, []);

  return { addons, loading, error };
};

export default useAddons; 