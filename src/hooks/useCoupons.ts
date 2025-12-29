import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Coupon {
  id: string;
  code: string;
  discount_percentage: number;
  discount_amount: number;
  is_percentage: boolean;
  active: boolean;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  return { coupons, loading, refetch: fetchCoupons };
};

export const validateCoupon = async (code: string): Promise<{
  valid: boolean;
  coupon?: Coupon;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (error || !data) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validUntil = data.valid_until ? new Date(data.valid_until) : null;

    if (now < validFrom) {
      return { valid: false, error: 'Coupon not yet valid' };
    }

    if (validUntil && now > validUntil) {
      return { valid: false, error: 'Coupon has expired' };
    }

    if (data.usage_limit && data.used_count >= data.usage_limit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    return { valid: true, coupon: data };
  } catch (error) {
    return { valid: false, error: 'Error validating coupon' };
  }
};

export const createCoupon = async (couponData: {
  code: string;
  discount_percentage?: number;
  discount_amount?: number;
  is_percentage: boolean;
  usage_limit?: number;
  valid_from: string;
  valid_until?: string;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const insertData: any = {
    code: couponData.code.toUpperCase(),
    is_percentage: couponData.is_percentage,
    created_by: user.id,
    valid_from: couponData.valid_from,
  };

  if (couponData.is_percentage && couponData.discount_percentage !== undefined) {
    insertData.discount_percentage = couponData.discount_percentage;
    insertData.discount_amount = 0;
  } else if (!couponData.is_percentage && couponData.discount_amount !== undefined) {
    insertData.discount_amount = couponData.discount_amount;
    insertData.discount_percentage = 0;
  }

  if (couponData.usage_limit) {
    insertData.usage_limit = couponData.usage_limit;
  }

  if (couponData.valid_until) {
    insertData.valid_until = couponData.valid_until;
  }

  const { error } = await supabase.from('coupons').insert(insertData);

  return !error;
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
  const { error } = await supabase
    .from('coupons')
    .update(updates)
    .eq('id', id);

  return !error;
};

export const deleteCoupon = async (id: string) => {
  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('id', id);

  return !error;
};
