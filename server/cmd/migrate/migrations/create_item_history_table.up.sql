create table if not exists item_history (
    id serial primary key,
    user_id uuid not null,
    item_id uuid not null references items(id) on delete cascade,
    data jsonb not null,
    created_at timestamp not null default now()
);
