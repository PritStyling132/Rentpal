import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export interface AdminStats {
  totalListings: number;
  pendingListings: number;
  approvedListings: number;
  totalRevenue: number;
  totalUsers: number;
  totalOwners: number;
  totalRentalRequests: number;
  totalBlogs: number;
  totalActiveAds: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalListings: 0,
    pendingListings: 0,
    approvedListings: 0,
    totalRevenue: 0,
    totalUsers: 0,
    totalOwners: 0,
    totalRentalRequests: 0,
    totalBlogs: 0,
    totalActiveAds: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, refetch: fetchStats };
};
