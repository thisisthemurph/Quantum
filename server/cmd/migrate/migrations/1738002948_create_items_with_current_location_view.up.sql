create or replace view items_with_current_location as (
    select
        i.*,
        ih.location_id as location_id, -- location_id is the id of the location or user
        case ih.type
            when 'tracked' then l.name
            when 'created' then l.name
            when 'tracked-user' then u.name
        end as location_name,
        case ih.type
            when 'tracked' then l.description
            when 'created' then l.description
            when 'tracked-user' then u.username
        end as location_description,
        ih.created_at as tracked_at,
        ih.type = 'tracked-user' as tracked_to_user
    from (
         -- Get the most recent created, tracked, tracked-user history record for each item.
         select distinct on (item_id)
             item_id,
             (data->>'type')::text as type,
             case (data->>'type')::text
                 when 'tracked' then (data->'data'->>'locationId')::uuid
                 when 'created' then (data->'data'->>'locationId')::uuid
                 when 'tracked-user' then (data->'data'->>'userId')::uuid
             end as location_id,
             created_at
         from item_history
         where (data->>'type') in ('created', 'tracked', 'tracked-user')
         order by item_id, created_at desc
     ) ih
        join items i on ih.item_id = i.id
        left join locations l
            on ih.location_id = l.id and ih.type in ('tracked', 'created')
        left join users u
            on ih.location_id = u.id and ih.type = 'tracked-user'
);
