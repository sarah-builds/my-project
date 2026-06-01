/*
  # Memora AI - Elderly Companion App Database Schema

  1. Purpose
    This database supports an AI companion app for elderly people and memory loss patients.
    It stores medicines, daily schedules, memories, contacts, and events.

  2. New Tables
    - `medicines` - Medicine reminders with name, dosage, time, and frequency
    - `schedules` - Daily schedule items with time, activity, and category
    - `memories` - Photo/event memories with descriptions and dates
    - `contacts` - Emergency and family contacts with phone numbers
    - `events` - Calendar events for appointments and activities

  3. Security
    - RLS enabled on all tables
    - Policies allow public read access (for demo purposes)
    - Insert/update/delete allowed for authenticated users
*/

-- Medicines table
CREATE TABLE IF NOT EXISTS medicines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dosage text NOT NULL DEFAULT '',
  time text NOT NULL,
  frequency text DEFAULT 'daily',
  taken boolean DEFAULT false,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  time text NOT NULL,
  activity text NOT NULL,
  category text DEFAULT 'general',
  completed boolean DEFAULT false,
  notes text DEFAULT '',
  day_of_week text DEFAULT 'today',
  created_at timestamptz DEFAULT now()
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  date text DEFAULT '',
  image_url text DEFAULT '',
  tags text[] DEFAULT '{}',
  is_favorite boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  relationship text DEFAULT 'family',
  phone text NOT NULL,
  is_emergency boolean DEFAULT false,
  is_favorite boolean DEFAULT false,
  photo_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  date text NOT NULL,
  time text DEFAULT '',
  location text DEFAULT '',
  type text DEFAULT 'appointment',
  notes text DEFAULT '',
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public read policies (for demo)
CREATE POLICY "Public can view medicines"
  ON medicines FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view schedules"
  ON schedules FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view memories"
  ON memories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view contacts"
  ON contacts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can view events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert policies for authenticated users
CREATE POLICY "Authenticated can insert medicines"
  ON medicines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert schedules"
  ON schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert memories"
  ON memories FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Update policies
CREATE POLICY "Authenticated can update medicines"
  ON medicines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update schedules"
  ON schedules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update memories"
  ON memories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Delete policies
CREATE POLICY "Authenticated can delete medicines"
  ON medicines FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete schedules"
  ON schedules FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete memories"
  ON memories FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data

-- Sample contacts
INSERT INTO contacts (name, relationship, phone, is_emergency, is_favorite) VALUES
('Michael (Son)', 'son', '+1 (555) 123-4567', false, true),
('Sarah (Daughter)', 'daughter', '+1 (555) 234-5678', false, true),
('Dr. Robert Smith', 'doctor', '+1 (555) 345-6789', false, true),
('Emergency Services', 'emergency', '911', true, true),
('Nurse Jennifer', 'caregiver', '+1 (555) 456-7890', false, false);

-- Sample medicines
INSERT INTO medicines (name, dosage, time, frequency, notes) VALUES
('Metformin', '500mg', '08:00 AM', 'daily', 'Take with breakfast'),
('Lisinopril', '10mg', '08:00 AM', 'daily', 'For blood pressure'),
('Aspirin', '81mg', '08:00 AM', 'daily', 'Heart health'),
('Vitamin D', '1000 IU', '12:00 PM', 'daily', 'Take with lunch'),
('Metformin', '500mg', '06:00 PM', 'daily', 'Take with dinner'),
('Lunesta', '3mg', '09:00 PM', 'as needed', 'For sleep - only if needed');

-- Sample schedules
INSERT INTO schedules (time, activity, category, day_of_week) VALUES
('07:00 AM', 'Wake up and morning routine', 'routine', 'today'),
('07:30 AM', 'Breakfast', 'meal', 'today'),
('08:00 AM', 'Take morning medicines', 'medicine', 'today'),
('09:00 AM', 'Morning walk in the garden', 'exercise', 'today'),
('10:00 AM', 'Video call with Sarah', 'social', 'today'),
('12:00 PM', 'Lunch', 'meal', 'today'),
('01:00 PM', 'Rest time', 'rest', 'today'),
('02:00 PM', 'Doctor appointment - Dr. Smith', 'appointment', 'today'),
('04:00 PM', 'Afternoon tea and snack', 'meal', 'today'),
('05:00 PM', 'Memory activities', 'activity', 'today'), 
('06:00 PM', 'Dinner', 'meal', 'today'),
('06:30 PM', 'Take evening medicines', 'medicine', 'today'),
('08:00 PM', 'Watch favorite TV show', 'leisure', 'today'),
('09:00 PM', 'Bedtime routine', 'routine', 'today');

-- Sample memories
INSERT INTO memories (title, description, date, tags, is_favorite) VALUES
('Family Reunion 2025', 'Wonderful day with the whole family. Grandchildren played in the garden.', '2025-06-15', ARRAY['family', 'celebration'], true),
('Wedding Anniversary', '50th wedding anniversary celebration with Robert. Such special memories.', '2024-09-20', ARRAY['milestone', 'couple'], true),
('Graduation Day', 'Michael graduated from college. So proud of our son.', '1995-05-18', ARRAY['family', 'pride'], true),
('Sisters Birthday', 'Celebrated at the old house. Made her favorite chocolate cake.', '2024-01-15', ARRAY['family', 'birthday'], false),
('Trip to Bahamas', 'First vacation with the grandchildren. Building sandcastles together.', '2024-07-10', ARRAY['travel', 'family'], true);

-- Sample events
INSERT INTO events (title, date, time, location, type, notes) VALUES
('Doctor Appointment', '2026-05-28', '02:00 PM', 'City Medical Center', 'appointment', 'Regular checkup with Dr. Smith'),
('Hair Appointment', '2026-05-30', '10:00 AM', 'Sallys Salon', 'personal', 'Monthly hair appointment'),
('Physical Therapy', '2026-05-29', '09:00 AM', 'Wellness Center', 'medical', 'Weekly session'),
('Family Visit', '2026-06-01', '12:00 PM', 'Home', 'social', 'Sarah and kids visiting for lunch'),
('Eye Doctor', '2026-06-05', '11:00 AM', 'Vision Care Clinic', 'appointment', 'Annual eye exam');
