/*
# Create scan_reports table (single-tenant, no auth)

1. Purpose
   SapaScan persists every AR scan session as a "scan report" so inspectors can
   review issued prescriptions and their resolution status across sessions.
   This is a demo/single-tenant app (no sign-in screen), so reports are shared
   and readable/writable by the anon-key frontend.

2. New Tables
   - `scan_reports`
     - `id`              uuid, primary key
     - `report_id`       text, human-readable id (e.g. SPR-AB12CD), unique
     - `object_id`       text, construction object reference
     - `object_name`     text, denormalized object name for list display
     - `object_label`    text, full "Объект / Блок / Этаж / Помещение" label
     - `defect_count`    int, total defects found
     - `high_risk_count` int, high-risk defects
     - `medium_risk_count` int, medium-risk defects
     - `low_risk_count`  int, low-risk defects
     - `top_regulation`  text, the most severe regulation violated
     - `status`          text, 'draft' | 'issued' | 'resolved' (default 'issued')
     - `created_at`      timestamptz, default now()

3. Security
   - Enable RLS on `scan_reports`.
   - Allow anon + authenticated full CRUD because data is intentionally shared
     in this single-tenant demo (no sign-in). USING (true) is documented as
     intentional for the shared demo dataset.

4. Indexes
   - `scan_reports_created_at_idx` on `created_at DESC` for list ordering.
*/

CREATE TABLE IF NOT EXISTS scan_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id text UNIQUE NOT NULL,
  object_id text NOT NULL,
  object_name text NOT NULL,
  object_label text NOT NULL,
  defect_count int NOT NULL DEFAULT 0,
  high_risk_count int NOT NULL DEFAULT 0,
  medium_risk_count int NOT NULL DEFAULT 0,
  low_risk_count int NOT NULL DEFAULT 0,
  top_regulation text,
  status text NOT NULL DEFAULT 'issued' CHECK (status IN ('draft','issued','resolved')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scan_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_scan_reports" ON scan_reports;
CREATE POLICY "anon_select_scan_reports" ON scan_reports
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_scan_reports" ON scan_reports;
CREATE POLICY "anon_insert_scan_reports" ON scan_reports
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_scan_reports" ON scan_reports;
CREATE POLICY "anon_update_scan_reports" ON scan_reports
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_scan_reports" ON scan_reports;
CREATE POLICY "anon_delete_scan_reports" ON scan_reports
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS scan_reports_created_at_idx ON scan_reports (created_at DESC);
