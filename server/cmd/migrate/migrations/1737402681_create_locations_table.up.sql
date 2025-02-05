create table if not exists locations (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    description text,
    is_deleted boolean not null default false,
    created_at timestamp with time zone not null default current_timestamp,
    updated_at timestamp with time zone not null default current_timestamp
);
