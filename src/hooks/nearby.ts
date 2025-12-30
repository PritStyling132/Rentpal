import api from '@/lib/api';

export async function fetchNearbyListings(userLat: number, userLng: number, radiusMeters = 5000) {
  const response = await api.get('/listings/nearby', {
    params: {
      lat: userLat,
      lng: userLng,
      radius: radiusMeters
    }
  });

  return response.data as Array<{
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
