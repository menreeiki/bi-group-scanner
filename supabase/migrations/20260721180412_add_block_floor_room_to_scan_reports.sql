/*
# Add block/floor/room name columns to scan_reports

1. Purpose
   The object selection flow now uses free-text input for block, floor, and
   apartment instead of predefined dropdown options. These columns store the
   user-typed values so each scan report carries the full inspection context
   as structured data (in addition to the existing object_label text field).

2. Modified Tables
   - `scan_reports`
     - `block_name` text, nullable — user-typed block/section name
     - `floor_name` text, nullable — user-typed floor name
     - `room_name` text, nullable — user-typed apartment/room name

3. Security
   - No policy changes. Existing anon/authenticated CRUD policies still apply.

4. Notes
   - All three columns are nullable so existing rows are unaffected.
   - The object_label column is retained for backward compatibility and
     human-readable display; the new columns provide structured access.
*/

ALTER TABLE scan_reports ADD COLUMN IF NOT EXISTS block_name text;
ALTER TABLE scan_reports ADD COLUMN IF NOT EXISTS floor_name text;
ALTER TABLE scan_reports ADD COLUMN IF NOT EXISTS room_name text;