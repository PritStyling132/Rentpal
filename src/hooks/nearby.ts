import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchNearbyListings(userLat: number, userLng: number, radiusMeters = 5000) {
  const { data, error } = await supabase.rpc('get_nearby_listings', {
    user_lat: userLat,
    user_lng: userLng,
    radius_meters: radiusMeters
  });

  if (error) throw error;
  return data as Array<{
    id: string;
    product_name: string;
    rent_price: number;
    owner_user_id: string;
    city: string | null;
    state: string | null;
    pin_code: string | null;
    latitude: number;
    longitude: number;
    distance_meters: number;
  }>;
}