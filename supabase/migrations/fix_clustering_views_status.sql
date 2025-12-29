-- Fix clustering views to use 'approved' status instead of 'active'
-- This matches the actual listing_status values: 'pending', 'approved', 'rejected'

create or replace view public.v_clusters_by_pin as
select
	pin_code,
	count(*) as listing_count,
	avg(rent_price) as avg_rent_price,
	ST_Y(ST_Centroid(ST_Collect(location::geometry))) as center_lat,
	ST_X(ST_Centroid(ST_Collect(location::geometry))) as center_lng
from public.listings
where listing_status = 'approved' and location is not null  -- Changed from 'active' to 'approved'
group by pin_code
order by listing_count desc;

create or replace view public.v_clusters_by_city as
select
	city,
	count(*) as listing_count,
	ST_Y(ST_Centroid(ST_Collect(location::geometry))) as center_lat,
	ST_X(ST_Centroid(ST_Collect(location::geometry))) as center_lng
from public.listings
where listing_status = 'approved' and location is not null  -- Changed from 'active' to 'approved'
group by city
order by listing_count desc;

create or replace view public.v_clusters_by_geohash6 as
select
	left(geohash9, 6) as geohash6,
	count(*) as listing_count,
	ST_Y(ST_Centroid(ST_Collect(location::geometry))) as center_lat,
	ST_X(ST_Centroid(ST_Collect(location::geometry))) as center_lng
from public.listings
where listing_status = 'approved' and location is not null  -- Changed from 'active' to 'approved'
group by left(geohash9, 6)
order by listing_count desc;

grant select on public.v_clusters_by_pin to anon, authenticated;
grant select on public.v_clusters_by_city to anon, authenticated;
grant select on public.v_clusters_by_geohash6 to anon, authenticated;

