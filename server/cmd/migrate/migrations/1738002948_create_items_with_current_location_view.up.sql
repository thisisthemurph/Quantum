create or replace view items_with_current_location as (
    select
        i.*,
        l.id as location_id,
        l.name as location_name,
        l.description as location_description,
        ih.created_at as tracked_at
    from (
        -- Get the most recent created or tracked history record for each item.
        select distinct on (item_id)
           item_id,
           (data->'data'->>'locationId')::uuid as location_id,
           created_at
        from item_history
        where (data->>'type') in ('created', 'tracked')
        order by item_id, created_at desc
    ) ih
    join items i on ih.item_id = i.id
    join locations l on ih.location_id = l.id
);
