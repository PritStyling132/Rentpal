import { useState, useEffect, useCallback } from 'react';
import { listingsApi, adminApi } from '@/lib/api';

export interface Listing {
  id: string;
  ownerId: string;
  productName: string;
  description: string;
  images: string[];
  pricePerDay: number;
  pricePerWeek?: number | null;
  pricePerMonth?: number | null;
  securityDeposit?: number | null;
  pinCode: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  availability: boolean;
  availableFrom?: string | null;
  availableTo?: string | null;
  status: string;
  views: number;
  productType: 'rent' | 'sale' | 'both';
  category: string;
  condition?: string | null;
  brand?: string | null;
  model?: string | null;
  features: string[];
  rules: string[];
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    userType?: string;
  };
}

export const useListings = (status?: string, userId?: string, enabled: boolean = true) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = useCallback(async () => {
    if (!enabled) {
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {};

      if (status) {
        params.status = status;
      }

      if (userId) {
        params.ownerId = userId;
      }

      const response = await listingsApi.getListings(params);

      if (response.data.success) {
        setListings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  }, [status, userId, enabled]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return { listings, loading, refetch: fetchListings };
};

export const approveListing = async (listingId: string) => {
  try {
    const response = await adminApi.updateListingStatus(listingId, 'approved');
    return response.data.success;
  } catch (error) {
    console.error('Error approving listing:', error);
    return false;
  }
};

export const rejectListing = async (listingId: string, reason?: string) => {
  try {
    const response = await adminApi.updateListingStatus(listingId, 'rejected', reason);
    return response.data.success;
  } catch (error) {
    console.error('Error rejecting listing:', error);
    return false;
  }
};

export const incrementViews = async (listingId: string) => {
  try {
    const response = await listingsApi.incrementViews(listingId);
    return response.data.success;
  } catch (error) {
    console.error('Error incrementing views:', error);
    return false;
  }
};
