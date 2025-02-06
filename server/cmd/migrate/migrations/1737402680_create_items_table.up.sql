create table if not exists items (
    id uuid primary key default uuid_generate_v4(),
    identifier text not null,
    reference text unique not null,
    group_key text not null,
    description text,
    deleted boolean not null default false,
    created_at timestamp with time zone not null default current_timestamp,
    updated_at timestamp with time zone not null default current_timestamp
);

create index items_group_key_idx on items (group_key);
