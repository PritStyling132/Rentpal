import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Listing {
  id: string;
  owner_user_id: string;
  product_name: string;
  description: string;
  images: string[];
  rent_price: number;
  pin_code: string;
  availability: boolean;
  payment_transaction: string;
  payment_verified: boolean;
  listing_status: string;
  views: number;
  rating: number | null;
  product_type: 'rent' | 'sale' | 'both';
  category: string;
  phone: string;
  address: string;
  created_at: string;
  listing_type?: string | null;
  coupon_code?: string;
  original_price?: number;
  discount_amount?: number;
  final_price?: number;
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
      let query = supabase.from('listings').select('*');
      
      if (status) {
        query = query.eq('listing_status', status);
      }
      
      if (userId) {
        query = query.eq('owner_user_id', userId);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setListings(data || []);
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
  const { error } = await supabase
    .from('listings')
    .update({ listing_status: 'approved', payment_verified: true })
    .eq('id', listingId);
  
  return !error;
};

export const rejectListing = async (listingId: string) => {
  const { error } = await supabase
    .from('listings')
    .update({ listing_status: 'rejected' })
    .eq('id', listingId);
  
  return !error;
};

export const incrementViews = async (listingId: string) => {
  const { error } = await supabase.rpc('increment_listing_views', {
    listing_id: listingId,
  });
  
  return !error;
};
