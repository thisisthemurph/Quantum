DELETE FROM item_history;
DELETE FROM locations;
DELETE FROM items;
DELETE FROM settings;
DELETE FROM users;
DELETE FROM user_roles;


-- password is the string password
INSERT INTO users (username, password, name)
VALUES
    ('admin', '$2a$10$qhV3xDdjNakp.KDYjcgnte7sX6HupQ7wjkhMMioIG/L5U2/f4xA8.', 'Adam Admin'),
    ('tracker', '$2a$10$qhV3xDdjNakp.KDYjcgnte7sX6HupQ7wjkhMMioIG/L5U2/f4xA8.', 'Timmy Tracker'),
    ('writer', '$2a$10$qhV3xDdjNakp.KDYjcgnte7sX6HupQ7wjkhMMioIG/L5U2/f4xA8.', 'Wayne Writer'),
    ('jane.doe', '$2a$10$kP3vXZdjMbpq.LDYmcgnue8tX7HxpQ8xjkhNMjoJG/M6V3/g5yB9.', 'Jane Doe'),
    ('michael.smith', '$2a$10$hT2uYAdkNapq.LDYkcgnpe9sY6HvpR9wjkhOMkoIH/N7W4/h6zC0.', 'Michael Smith'),
    ('emily.johnson', '$2a$10$pR4wXEdjOapq.MDYncgnue0sZ7IwpQ0xjkhPMloIG/O8X5/i7yD1.', 'Emily Johnson'),
    ('david.lee', '$2a$10$sU5xYFdkPapq.NDZocgnve1sA8JxpR1xjkhQMmoIH/P9Y6/j8zE2.', 'David Lee'),
    ('sophia.brown', '$2a$10$vW6yZGdkQbpq.ODaocgnwe2sB9KypS2xjkhRMnoIG/Q0Z7/k9AE3.', 'Sophia Brown'),
    ('william.jones', '$2a$10$xX7zAHdkRcpq.PDbpcgnxe3sC0LzpT3xjkhSMpoIH/R1a8/lABF4.', 'William Jones'),
    ('olivia.garcia', '$2a$10$yY8aBIdlSdpq.QDcrcgnye4sD1M0qU4xjkhTMqoIG/S2b9/mBCG5.', 'Olivia Garcia'),
    ('james.martin', '$2a$10$zZ9bCJdmTepq.RDdsdgnze5sE2N1rV5xjkhUMroIH/T3c0/nCDH6.', 'James Martin'),
    ('ava.thomas', '$2a$10$aA0cDKdnUfpq.SDetgnAf6sF3O2sW6xjkhVMsoIG/U4d1/oDEI7.', 'Ava Thomas'),
    ('benjamin.moore', '$2a$10$bB1dELdoVgpq.TDfugnbg7sG4P3tX7xjkhWMtoIH/V5e2/pEFJ8.', 'Benjamin Moore');


INSERT INTO user_roles (user_id, role)
SELECT id,
    CASE username
        WHEN 'admin' THEN 'admin'::user_role
        WHEN 'tracker' THEN 'tracker'::user_role
        WHEN 'writer' THEN 'writer'::user_role
        ELSE 'reader'::user_role
    END AS role
FROM users;

INSERT INTO locations (name, description)
VALUES
    ('Willow Creek', 'A serene riverside town known for its lush greenery and winding paths.'),
    ('Maple Grove', 'A charming neighborhood filled with maple trees and cozy homes.'),
    ('Sunnyvale', 'A bright and cheerful city with year-round sunshine.'),
    ('Cedar Point', 'A coastal spot famous for its scenic boardwalk and lighthouse.'),
    ('Oak Ridge', 'A quiet suburb surrounded by towering oak trees.'),
    ('Silver Lake', 'A peaceful town nestled beside a shimmering lake.'),
    ('Pine Hill', 'A hilly area dotted with tall pine forests.'),
    ('Riverbend', 'A vibrant community along the curve of a large river.'),
    ('Elmwood', 'A historic district with cobblestone streets and old elm trees.'),
    ('Crystal Bay', 'A picturesque bay town with crystal-clear waters.'),
    ('Harbor View', 'A bustling port city with scenic ocean views.'),
    ('Redwood Valley', 'Known for its towering redwood trees and lush valleys.'),
    ('Stonebridge', 'A quaint village with a famous stone bridge over a small creek.'),
    ('Lakeside', 'A peaceful area with homes lining the scenic lakeshore.'),
    ('Briarcliff', 'A small town perched on a dramatic cliffside.'),
    ('Golden Fields', 'An agricultural hub with vast golden wheat fields.'),
    ('Northgate', 'The northern gateway to a bustling metropolitan area.'),
    ('Southport', 'A lively coastal town known for its seafood markets.'),
    ('Eastwood', 'A residential area surrounded by dense woodlands.'),
    ('Westhaven', 'A harbor town with charming docks and seaside cafes.'),
    ('Spring Hollow', 'A peaceful valley known for its vibrant spring blooms.'),
    ('Brookside', 'A quiet community alongside a babbling brook.'),
    ('Fairview', 'A suburban neighborhood offering panoramic scenic views.'),
    ('Highland Park', 'A town with rolling hills and expansive public parks.'),
    ('Clearwater', 'Known for its pristine rivers and clean, fresh air.'),
    ('Meadowbrook', 'A scenic area filled with wildflower meadows and creeks.'),
    ('Foxglove', 'A small town named after the foxglove flowers that bloom in summer.'),
    ('Glenwood', 'Nestled in a glen surrounded by ancient woods.'),
    ('Aspen Ridge', 'A mountain town popular for skiing and aspen trees.'),
    ('Coral Cove', 'A tropical seaside village with vibrant coral reefs.'),
    ('Rosewood', 'A sophisticated town known for its rose gardens and fine dining.'),
    ('Birch Hollow', 'A hidden hollow surrounded by white birch forests.'),
    ('Shadow Creek', 'Mysterious and beautiful, with dense forests and hidden streams.'),
    ('Sunflower Plains', 'Expansive plains covered with bright sunflowers in summer.'),
    ('Glacier Point', 'A breathtaking spot offering views of distant glaciers.'),
    ('Crescent Bay', 'A bay shaped like a crescent moon with calm waters.'),
    ('Thornfield', 'A rustic town with fields lined by wild thorn bushes.'),
    ('Ivystone', 'An old town with stone architecture covered in ivy.'),
    ('Falcon Heights', 'A highland area known for falcon sightings and hiking trails.'),
    ('Holly Springs', 'Named for the holly trees and natural springs in the area.'),
    ('Bluebell', 'A colorful town with fields of bluebell flowers in spring.'),
    ('Driftwood', 'A beach town where driftwood lines the sandy shores.'),
    ('Amber Falls', 'A scenic location with waterfalls that shimmer in amber hues.'),
    ('Cloverfield', 'A large field often dotted with lucky four-leaf clovers.'),
    ('Granite Peak', 'A mountainous region with rugged granite cliffs.'),
    ('Wildflower Ridge', 'A ridge covered with diverse wildflowers.'),
    ('Seabreeze', 'A coastal town known for its refreshing sea breezes.'),
    ('Moonlight Bay', 'A romantic bay where the moonlight reflects off the water.'),
    ('Prairie View', 'A wide-open prairie with stunning sunset views.'),
    ('Whispering Pines', 'A tranquil forest where the pines seem to whisper in the wind.');


WITH random_refs AS (
    SELECT
        DISTINCT ON (ref)
        ref,
        lpad((random() * 999)::int::text, 3, '0') AS num
    FROM (
             SELECT
                 chr(65 + (random() * 25)::int) ||
                 chr(65 + (random() * 25)::int) ||
                 chr(65 + (random() * 25)::int) AS ref,
                 generate_series(1, 2000) AS gs
         ) sub
    LIMIT 1000
),
     final_items AS (
         SELECT
             ref || '-' || num AS reference,
             'GROUP-' || (1 + (random() * 10)::int) AS group_key,
             (ref || '-' || num) || '-GROUP-' || (1 + (random() * 10)::int) AS identifier,
             'A generic description of an item.' AS description
         FROM random_refs
     )
INSERT INTO items (reference, group_key, identifier, description)
SELECT * FROM final_items;


WITH item_locations AS (
    SELECT
        i.id item_id,
        reference,
        i.description,
        l.id location_id,
        i.group_key
    FROM items i
    JOIN locations l
        ON SUBSTRING(CAST(i.id AS text) from 1 for 1) = SUBSTRING(CAST(l.id AS text) from 1 for 1)
)
INSERT INTO item_history (user_id, item_id, data)
SELECT DISTINCT ON (item_id)
    (SELECT id FROM users WHERE username = 'tracker' LIMIT 1),  -- Replace with the desired user ID
    item_id,
    json_build_object(
            'data', jsonb_build_object(
            'group', group_key,
            'reference', reference,
            'locationId', location_id, -- Randomly chosen location for this item
            'description', description
                    ),
            'type', 'created'
    )
FROM item_locations;
