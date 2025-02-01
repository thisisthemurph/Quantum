create table if not exists item_history (
    id serial primary key,
    user_id uuid not null references users(id) on delete no action,
    item_id uuid not null references items(id) on delete no action,
    data jsonb not null,
    created_at timestamp with time zone not null default now()
);

create index idx_item_history_type_location
    on item_history ((data->>'type'), (data->'data'->>'locationId'));

create index idx_item_history_item_created_at
    on item_history (item_id, created_at desc);
