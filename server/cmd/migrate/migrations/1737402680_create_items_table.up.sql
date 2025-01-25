create table if not exists items (
    id uuid primary key default uuid_generate_v4(),
    reference text unique not null,
    group_key text not null,
    description text,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);

create index items_group_key_idx on items (group_key);
