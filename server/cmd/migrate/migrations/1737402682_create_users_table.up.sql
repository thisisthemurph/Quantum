--	admin: can do everything including delete items and locations. Implies reader, writer and tracker.
--	writer: can create/update items and locations but cannot delete them. Implies reader. Does not imply tracker.
--	tracker: can change the location of an item, but cannot create/update/delete. Implies reader.
--	reader: can only read items and locations.
create type user_role as enum ('admin', 'reader', 'writer', 'tracker');

create table if not exists users (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    username text not null unique,
    password text not null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

create table if not exists user_roles (
    id serial primary key,
    user_id uuid not null references users(id) on delete cascade,
    role user_role not null,
    created_at timestamp with time zone default now(),

    unique (user_id, role)
);
