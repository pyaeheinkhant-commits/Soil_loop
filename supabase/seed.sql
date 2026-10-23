-- Synthetic Precinct 3 seed. Labels are honest: weighed vs estimated.

insert into blocks values
('BLK-A', 'Block A', 'Precinct 3, Township X', 'Sunday, 6:00 PM', 'USR-002', 'Kebun Komuniti A'),
('BLK-B', 'Block B', 'Precinct 3, Township X', 'Sunday, 6:00 PM', 'USR-002', 'Kebun Komuniti A'),
('BLK-C', 'Block C', 'Precinct 3, Township X', 'Sunday, 6:00 PM', 'USR-002', 'Kebun Komuniti A');

-- Auth users must be created in Supabase Auth separately, then mapped here.
insert into users values
('USR-001', 'Aisyah', 'resident', 'BLK-B', 'resident@soilloop.demo', 'English'),
('USR-002', 'Farid', 'collector', null, 'collector@soilloop.demo', 'English'),
('USR-003', 'Puan Lim', 'gardener', null, 'gardener@soilloop.demo', 'English'),
('USR-004', 'Encik Rahman', 'operator', null, 'operator@soilloop.demo', 'English'),
('USR-005', 'Mei', 'champion', 'BLK-B', 'champion@soilloop.demo', 'English');

insert into bins values
('BIN-A-01', 'BLK-A', 'Level 1 bin room, next to the recycling cages', 120, 'available',
 ARRAY['Fruit peels','Vegetable scraps','Coffee grounds','Tea leaves','Plain cooked rice or noodles','Stale bread'],
 ARRAY['Eggshells','Cooked food','Small amounts of meat'],
 ARRAY['Plastic','Oil, soup, gravy','Bones','Diapers','Styrofoam','Tissues','Chemicals']),
('BIN-B-01', 'BLK-B', 'Level 1 bin room, brown food-waste caddy beside the chute', 120, 'nearly_full',
 ARRAY['Fruit peels','Vegetable scraps','Coffee grounds','Tea leaves','Plain cooked rice or noodles','Stale bread'],
 ARRAY['Eggshells','Cooked food','Small amounts of meat'],
 ARRAY['Plastic','Oil, soup, gravy','Bones','Diapers','Styrofoam','Tissues','Chemicals']),
('BIN-C-01', 'BLK-C', 'Ground floor service corridor, marked Food scraps', 120, 'available',
 ARRAY['Fruit peels','Vegetable scraps','Coffee grounds','Tea leaves','Plain cooked rice or noodles','Stale bread'],
 ARRAY['Eggshells','Cooked food','Small amounts of meat'],
 ARRAY['Plastic','Oil, soup, gravy','Bones','Diapers','Styrofoam','Tissues','Chemicals']);

insert into batches values
('BATCH-012', 'Kebun Komuniti A', '2026-08-16', 60, ARRAY['BLK-A','BLK-B','BLK-C'],
 'Hot composting', '2026-10-11', '2026-10-14', 15, 'passed',
 'Mature, no odour, no visible contaminants.', 'ready'),
('BATCH-013', 'Kebun Komuniti A', '2026-10-18', 16, ARRAY['BLK-A'],
 'Hot composting', '2026-12-13', null, null, 'pending', '', 'composting');

insert into collections values
('COL-001', 'BLK-A', 'BIN-A-01', 'USR-002', '2026-08-16T18:10:00+08:00', 20, 'calibrated_scale', 'clean', '', 'Kebun Komuniti A', 'BATCH-012', 'completed'),
('COL-002', 'BLK-B', 'BIN-B-01', 'USR-002', '2026-08-16T18:20:00+08:00', 18, 'calibrated_scale', 'minor', 'Plastic bag observed.', 'Kebun Komuniti A', 'BATCH-012', 'completed'),
('COL-003', 'BLK-C', 'BIN-C-01', 'USR-002', '2026-08-16T18:35:00+08:00', 22, 'calibrated_scale', 'clean', '', 'Kebun Komuniti A', 'BATCH-012', 'completed'),
('COL-004', 'BLK-A', 'BIN-A-01', 'USR-002', '2026-10-18T18:05:00+08:00', 16, 'calibrated_scale', 'clean', '', 'Kebun Komuniti A', 'BATCH-013', 'completed'),
('COL-005', 'BLK-C', 'BIN-C-01', 'USR-002', '2026-10-18T18:40:00+08:00', 14, 'estimated', 'rejected', 'Oil and styrofoam. Not diverted.', 'General waste', null, 'completed');

insert into gardens values
('GARDEN-001', 'Community Herb Garden', 'Near Block B, precinct green', 'USR-003');

insert into compost_uses values
('USE-001', 'GARDEN-001', 'BATCH-012', 10, '2026-10-16', 'Beds 1–4',
 'Lemongrass, mint and chilli planted into compost-amended beds.', '');

insert into checkins values
('CHK-001', 'USR-001', 'BLK-B', 'BIN-B-01', '2026-09-20T10:12:00+08:00', 'manual'),
('CHK-002', 'USR-001', 'BLK-B', 'BIN-B-01', '2026-09-27T09:40:00+08:00', 'manual'),
('CHK-003', 'USR-001', 'BLK-B', 'BIN-B-01', '2026-10-04T11:05:00+08:00', 'manual'),
('CHK-004', 'USR-001', 'BLK-B', 'BIN-B-01', '2026-10-11T10:22:00+08:00', 'manual');
