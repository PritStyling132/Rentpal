// utils/location.ts
import ngeohash from 'ngeohash';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type GeocodeResult = {
  lat: number;
  lon: number;
  city?: string;
  state?: string;
  locality?: string;
};

export async function geocodeWithNominatim(query: string): Promise<GeocodeResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '1');

  const res = await fetch(url.toString(), {
    headers: {
      'User-Agent': 'RentPal/1.0 (contact: youremail@example.com)'
    }
  });

  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;

  const item = data[0];
  const address = item.address ?? {};
  return {
    lat: Number(item.lat),
    lon: Number(item.lon),
    city: address.city || address.town || address.village || address.county,
    state: address.state,
    locality: address.suburb || address.neighbourhood || address.hamlet
  };
}

export async function insertListing(listing: {
  owner_user_id: string;
  product_name: string;
  description?: string;
  category?: string;
  pin_code?: string;
  phone?: string;
  address?: string;
  rent_price?: number;
  original_price?: number;
  discount_amount?: number;
  final_price?: number;
  product_type?: string;
  package_id?: string;
  listing_type?: string;
}) {
  const search = listing.address || listing.pin_code;
  if (!search) throw new Error('Address or pin_code is required to geocode');

  const geo = await geocodeWithNominatim(search);
  if (!geo) throw new Error('Unable to geocode address');

  const geohash = ngeohash.encode(geo.lat, geo.lon, 9);

  const { data, error } = await supabase
    .from('listings')
    .insert([
      {
        owner_user_id: listing.owner_user_id,
        product_name: listing.product_name,
        description: listing.description,
        category: listing.category,
        pin_code: listing.pin_code,
        phone: listing.phone,
        address: listing.address,
        rent_price: listing.rent_price,
        original_price: listing.original_price,
        discount_amount: listing.discount_amount,
        final_price: listing.final_price,
        product_type: listing.product_type,
        package_id: listing.package_id,
        listing_type: listing.listing_type,

        latitude: geo.lat,
        longitude: geo.lon,
        city: geo.city,
        state: geo.state,
        locality: geo.locality,

        geohash // optional; DB also generates geohash9
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}