-- Fix get_nearby_listings to use 'approved' status instead of 'active'
-- This matches the actual listing_status values: 'pending', 'approved', 'rejected'

create or replace function public.get_nearby_listings(
	in user_lat double precision,
	in user_lng double precision,
	in radius_meters integer default 5000
)
returns table (
	id uuid,
	product_name text,
	rent_price numeric,
	owner_user_id uuid,
	city text,
	state text,
	pin_code text,
	latitude double precision,
	longitude double precision,
	distance_meters double precision
)
language sql
stable
as $$
	with origin as (
		select ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography as g
	)
	select
		l.id,
		l.product_name,
		l.rent_price,
		l.owner_user_id,
		l.city,
		l.state,
		l.pin_code,
		l.latitude,
		l.longitude,
		ST_Distance(l.location, o.g) as distance_meters
	from public.listings l
	cross join origin o
	where l.location is not null
	  and l.listing_status = 'approved'  -- Changed from 'active' to 'approved'
	  and ST_DWithin(l.location, o.g, radius_meters)
	order by ST_Distance(l.location, o.g) asc;
$$;

grant execute on function public.get_nearby_listings(double precision, double precision, integer) to anon, authenticated;

