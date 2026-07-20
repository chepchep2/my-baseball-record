alter table batter_record
    add column sacrifice_bunts integer not null default 0,
    add column sacrifice_flies integer not null default 0;
