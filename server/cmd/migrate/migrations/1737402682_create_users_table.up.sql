create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    email text not null unique,
    password text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);
