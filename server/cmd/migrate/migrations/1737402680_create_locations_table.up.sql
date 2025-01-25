create table if not exists locations (
    id uuid primary key default uuid_generate_v4(),
    group_key text not null,
    name text unique not null,
    description text,
    created_at timestamp not null default current_timestamp,
    updated_at timestamp not null default current_timestamp
);
