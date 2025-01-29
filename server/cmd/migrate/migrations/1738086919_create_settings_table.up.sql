create table if not exists settings (
    id int primary key, -- not using serial because we want to enforce only one row
    data jsonb not null
);
