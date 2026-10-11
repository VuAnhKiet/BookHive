-- Development-only seed data: 12 demo users, 2 stores, and 30 sample books.
-- Demo account password for every user: password
-- Do not use these accounts or passwords outside a local development database.
-- Requires all database migrations to have been run before applying this file.

BEGIN;

INSERT INTO "users" ("id", "fullName", "email", "password", "role", "wallet_balance")
VALUES
  ('00000000-0000-4000-8000-000000000001', 'Avery Morgan', 'reader01@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 25.00),
  ('00000000-0000-4000-8000-000000000002', 'Jordan Lee', 'reader02@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 40.00),
  ('00000000-0000-4000-8000-000000000003', 'Casey Bennett', 'reader03@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 15.00),
  ('00000000-0000-4000-8000-000000000004', 'Riley Chen', 'reader04@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 32.50),
  ('00000000-0000-4000-8000-000000000005', 'Taylor Brooks', 'reader05@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 0.00),
  ('00000000-0000-4000-8000-000000000006', 'Morgan Patel', 'reader06@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 18.00),
  ('00000000-0000-4000-8000-000000000007', 'Quinn Rivera', 'reader07@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 55.00),
  ('00000000-0000-4000-8000-000000000008', 'Alex Kim', 'reader08@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 12.00),
  ('00000000-0000-4000-8000-000000000009', 'Jamie Okafor', 'reader09@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 27.50),
  ('00000000-0000-4000-8000-000000000010', 'Skyler Nguyen', 'reader10@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'user', 8.00)
ON CONFLICT ("email") DO UPDATE SET "password" = EXCLUDED."password";

INSERT INTO "users" ("id", "fullName", "email", "password", "role", "wallet_balance")
VALUES
  ('00000000-0000-4000-8000-000000000011', 'Central Store Manager', 'manager01@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'store_manager', 0.00),
  ('00000000-0000-4000-8000-000000000012', 'Riverside Store Manager', 'manager02@demo.bookhive.test', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjZAgcfl7p92ldGxad68LJZdL17lhWy', 'store_manager', 0.00)
ON CONFLICT ("email") DO UPDATE SET
  "fullName" = EXCLUDED."fullName",
  "password" = EXCLUDED."password",
  "role" = EXCLUDED."role";

INSERT INTO "stores" ("id", "name", "location", "store_manager_id")
VALUES
  ('00000000-0000-4000-8000-000000000201', 'BookHive Central', 'Central District', (SELECT "id" FROM "users" WHERE "email" = 'manager01@demo.bookhive.test')),
  ('00000000-0000-4000-8000-000000000202', 'BookHive Riverside', 'Riverside District', (SELECT "id" FROM "users" WHERE "email" = 'manager02@demo.bookhive.test'))
ON CONFLICT ("id") DO UPDATE SET
  "name" = EXCLUDED."name",
  "location" = EXCLUDED."location",
  "store_manager_id" = EXCLUDED."store_manager_id";

INSERT INTO "books" (
  "id", "title", "author", "genre", "description", "cover_image", "copies",
  "status", "owner_id", "store_id", "rental_price_per_day", "late_fee_per_day", "condition"
)
VALUES
  ('00000000-0000-4000-8000-000000000101', 'The Lantern Map', 'Mira Ellery', 'Adventure', 'A quiet cartographer follows a trail of lanterns to a town missing from every map.', 'https://placehold.co/400x600/png?text=The+Lantern+Map', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader01@demo.bookhive.test'), NULL, 2.50, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000102', 'Small Hours at Marigold Cafe', 'Theo Wren', 'Contemporary', 'Three strangers find fresh starts while helping reopen a neighborhood cafe.', 'https://placehold.co/400x600/png?text=Marigold+Cafe', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader02@demo.bookhive.test'), NULL, 2.00, 0.50, 'new'),
  ('00000000-0000-4000-8000-000000000103', 'The Glass Orchard', 'Nadia Vale', 'Fantasy', 'An apprentice gardener discovers that the glass fruit in her care holds forgotten memories.', 'https://placehold.co/400x600/png?text=The+Glass+Orchard', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader03@demo.bookhive.test'), NULL, 3.00, 0.75, 'good'),
  ('00000000-0000-4000-8000-000000000104', 'Signal from North Pier', 'Elliot March', 'Mystery', 'A radio archivist deciphers a late-night broadcast linked to a decades-old disappearance.', 'https://placehold.co/400x600/png?text=North+Pier', 3, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader04@demo.bookhive.test'), NULL, 2.75, 0.50, 'fair'),
  ('00000000-0000-4000-8000-000000000105', 'A Pocketful of Comets', 'Lena Solis', 'Science Fiction', 'A rookie pilot carries a tiny experimental starship and one impossible delivery.', 'https://placehold.co/400x600/png?text=Pocketful+of+Comets', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader05@demo.bookhive.test'), NULL, 3.25, 0.75, 'good'),
  ('00000000-0000-4000-8000-000000000106', 'The Borrowed Garden', 'Imani North', 'Literary Fiction', 'A shared community garden brings a divided apartment block together over one summer.', 'https://placehold.co/400x600/png?text=The+Borrowed+Garden', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader06@demo.bookhive.test'), NULL, 2.25, 0.50, 'new'),
  ('00000000-0000-4000-8000-000000000107', 'Midnight at Cedar House', 'Rowan Pike', 'Mystery', 'A visiting piano tuner notices that every clock in an old guesthouse stops at the same minute.', 'https://placehold.co/400x600/png?text=Cedar+House', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader07@demo.bookhive.test'), NULL, 2.50, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000108', 'The Paper Astronomer', 'Sana Idris', 'Fantasy', 'A young scholar charts constellations that appear only on the pages of an antique atlas.', 'https://placehold.co/400x600/png?text=Paper+Astronomer', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader08@demo.bookhive.test'), NULL, 3.00, 0.75, 'fair'),
  ('00000000-0000-4000-8000-000000000109', 'Last Stop, Willow Creek', 'Beckett Shaw', 'Romance', 'Two former classmates share a bus route and reconsider the plans they left behind.', 'https://placehold.co/400x600/png?text=Willow+Creek', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader09@demo.bookhive.test'), NULL, 2.00, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000110', 'The Quiet Frequency', 'Amara Finch', 'Science Fiction', 'A sound engineer hears a repeating pattern that may be a message from a distant ocean.', 'https://placehold.co/400x600/png?text=Quiet+Frequency', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader10@demo.bookhive.test'), NULL, 3.25, 0.75, 'new'),
  ('00000000-0000-4000-8000-000000000111', 'Maps for the Missing', 'Devon Hart', 'Adventure', 'A siblings'' search for a lost relative leads them through a collection of hand-drawn city maps.', 'https://placehold.co/400x600/png?text=Maps+for+the+Missing', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader01@demo.bookhive.test'), NULL, 2.75, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000112', 'The Blue Hour Bakery', 'Cleo Winters', 'Contemporary', 'A night baker rebuilds her life one loaf and one conversation at a time.', 'https://placehold.co/400x600/png?text=Blue+Hour+Bakery', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader02@demo.bookhive.test'), NULL, 2.25, 0.50, 'fair'),
  ('00000000-0000-4000-8000-000000000113', 'Foxfire Station', 'Malik Rowan', 'Fantasy', 'Keepers at a remote train station guide travelers between the ordinary world and the strange one.', 'https://placehold.co/400x600/png?text=Foxfire+Station', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader03@demo.bookhive.test'), NULL, 3.00, 0.75, 'good'),
  ('00000000-0000-4000-8000-000000000114', 'The Seventh Envelope', 'June Calder', 'Mystery', 'A new envelope arrives every year with clues to a family secret nobody remembers.', 'https://placehold.co/400x600/png?text=Seventh+Envelope', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader04@demo.bookhive.test'), NULL, 2.50, 0.50, 'new'),
  ('00000000-0000-4000-8000-000000000115', 'Orbit of the Little Moon', 'Parker Sato', 'Science Fiction', 'A lunar mechanic finds an unexpected passenger in a repair bay beyond the far side of the moon.', 'https://placehold.co/400x600/png?text=Little+Moon', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader05@demo.bookhive.test'), NULL, 3.50, 0.75, 'good'),
  ('00000000-0000-4000-8000-000000000116', 'The House on Fern Street', 'Esther Bell', 'Literary Fiction', 'A neighborhood reflects on change when an empty family home is finally put up for sale.', 'https://placehold.co/400x600/png?text=Fern+Street', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader06@demo.bookhive.test'), NULL, 2.25, 0.50, 'fair'),
  ('00000000-0000-4000-8000-000000000117', 'A Study in Snowfall', 'Kit Mercer', 'Mystery', 'A winter lodge becomes a puzzle when its guests discover a room that is missing from the plans.', 'https://placehold.co/400x600/png?text=Study+in+Snowfall', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader07@demo.bookhive.test'), NULL, 2.75, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000118', 'The Moonseed Library', 'Farah Linden', 'Fantasy', 'A librarian tends a hidden collection of seeds that grow into stories when planted.', 'https://placehold.co/400x600/png?text=Moonseed+Library', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader08@demo.bookhive.test'), NULL, 3.00, 0.75, 'new'),
  ('00000000-0000-4000-8000-000000000119', 'Letters from Sunday', 'Noah Grey', 'Romance', 'A box of unsent letters helps two neighbors see each other in a new light.', 'https://placehold.co/400x600/png?text=Letters+from+Sunday', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader09@demo.bookhive.test'), NULL, 2.00, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000120', 'Below the Salt Line', 'Zuri Hale', 'Adventure', 'A marine biology team investigates a new reef forming beneath a forgotten shipping lane.', 'https://placehold.co/400x600/png?text=Below+the+Salt+Line', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader10@demo.bookhive.test'), NULL, 3.25, 0.75, 'fair'),
  ('00000000-0000-4000-8000-000000000121', 'The Clockmaker''s Picnic', 'Milo Ash', 'Contemporary', 'An eccentric clockmaker invites the town to help solve a very personal timing problem.', 'https://placehold.co/400x600/png?text=Clockmakers+Picnic', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader01@demo.bookhive.test'), NULL, 2.25, 0.50, 'new'),
  ('00000000-0000-4000-8000-000000000122', 'Rain on the Red Planet', 'Asha Quinn', 'Science Fiction', 'A climate researcher at a Mars outpost must decide what should be saved when the dome fails.', 'https://placehold.co/400x600/png?text=Rain+on+Mars', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader02@demo.bookhive.test'), NULL, 3.50, 0.75, 'good'),
  ('00000000-0000-4000-8000-000000000123', 'The Orchard at the Edge', 'Sloane Avery', 'Fantasy', 'A family orchard grows fruit that reveals one possible future to whoever tastes it.', 'https://placehold.co/400x600/png?text=Edge+Orchard', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader03@demo.bookhive.test'), NULL, 2.75, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000124', 'A Name in the Margins', 'Dara Ellis', 'Mystery', 'A used-book seller finds the same unfamiliar name written in books from unrelated collections.', 'https://placehold.co/400x600/png?text=Name+in+Margins', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader04@demo.bookhive.test'), NULL, 2.50, 0.50, 'fair'),
  ('00000000-0000-4000-8000-000000000125', 'The Long Way to Juniper', 'Wesley Park', 'Adventure', 'A courier takes a scenic route across the country to deliver a package with no return address.', 'https://placehold.co/400x600/png?text=Long+Way+to+Juniper', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader05@demo.bookhive.test'), NULL, 2.75, 0.50, 'new'),
  ('00000000-0000-4000-8000-000000000126', 'When the River Turns', 'Mina Solberg', 'Literary Fiction', 'A riverside community adapts together after a seasonal flood changes the shape of its town.', 'https://placehold.co/400x600/png?text=When+River+Turns', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader06@demo.bookhive.test'), NULL, 2.25, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000127', 'The Night Archive', 'Rafi Cole', 'Mystery', 'An archivist working the night shift discovers that one collection changes while the building is closed.', 'https://placehold.co/400x600/png?text=Night+Archive', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader07@demo.bookhive.test'), NULL, 3.00, 0.75, 'fair'),
  ('00000000-0000-4000-8000-000000000128', 'A Map of Warm Places', 'Elodie Moss', 'Romance', 'A travel writer and a local guide trade favorite places while planning a town festival.', 'https://placehold.co/400x600/png?text=Warm+Places', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader08@demo.bookhive.test'), NULL, 2.00, 0.50, 'good'),
  ('00000000-0000-4000-8000-000000000129', 'The Last Kite Festival', 'Arden Wells', 'Contemporary', 'A family returns to its coastal hometown to revive the celebration that once brought everyone together.', 'https://placehold.co/400x600/png?text=Last+Kite+Festival', 1, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader09@demo.bookhive.test'), NULL, 2.25, 0.50, 'new'),
  ('00000000-0000-4000-8000-000000000130', 'The Cartographer of Clouds', 'Sami Laurent', 'Fantasy', 'A weather observer draws maps of clouds that point toward places lost to ordinary sight.', 'https://placehold.co/400x600/png?text=Cartographer+of+Clouds', 2, 'available', (SELECT "id" FROM "users" WHERE "email" = 'reader10@demo.bookhive.test'), NULL, 3.25, 0.75, 'good')
ON CONFLICT ("id") DO NOTHING;

-- Assign stores after insertion so this also repairs books from an earlier seed run.
UPDATE "books"
SET "store_id" = CASE
  WHEN RIGHT("id"::text, 3)::integer <= 115
    THEN '00000000-0000-4000-8000-000000000201'::uuid
  ELSE '00000000-0000-4000-8000-000000000202'::uuid
END
WHERE "id" BETWEEN
  '00000000-0000-4000-8000-000000000101'::uuid AND
  '00000000-0000-4000-8000-000000000130'::uuid;

COMMIT;
