import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number | null;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  usedCount: number;
  validFrom?: string | null;
  validUntil?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getCoupons();
      if (response.data.success) {
        setCoupons(response.data.data || []);
      }
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

export const validateCoupon = async (
  code: string
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  error?: string;
}> => {
  try {
    const response = await adminApi.getCoupons();
    if (!response.data.success) {
      return { valid: false, error: 'Error fetching coupons' };
    }

    const coupon = (response.data.data as Coupon[]).find(
      (c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive
    );

    if (!coupon) {
      return { valid: false, error: 'Invalid coupon code' };
    }

    const now = new Date();
    const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null;
    const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;

    if (validFrom && now < validFrom) {
      return { valid: false, error: 'Coupon not yet valid' };
    }

    if (validUntil && now > validUntil) {
      return { valid: false, error: 'Coupon has expired' };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { valid: false, error: 'Coupon usage limit reached' };
    }

    return { valid: true, coupon };
  } catch (error) {
    return { valid: false, error: 'Error validating coupon' };
  }
};

export const createCoupon = async (couponData: {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  validFrom?: string;
  validUntil?: string;
  isActive?: boolean;
}) => {
  try {
    const response = await adminApi.createCoupon(couponData);
    return response.data.success;
  } catch (error) {
    console.error('Error creating coupon:', error);
    return false;
  }
};

export const updateCoupon = async (id: string, updates: Partial<Coupon>) => {
  try {
    const response = await adminApi.updateCoupon(id, updates);
    return response.data.success;
  } catch (error) {
    console.error('Error updating coupon:', error);
    return false;
  }
};

export const deleteCoupon = async (id: string) => {
  try {
    const response = await adminApi.deleteCoupon(id);
    return response.data.success;
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return false;
  }
};
