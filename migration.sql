-- Migration script to add show_background_image column, message columns, and create rsvp_responses table
-- Run this in your Supabase SQL editor

ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS show_background_image BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS itinerary_message TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS accommodation_message TEXT;
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS gift_registry_message TEXT;

-- Update existing records to have the column set to true (showing background images by default)
UPDATE admin_settings SET show_background_image = true WHERE show_background_image IS NULL;

-- Create rsvp_responses table
CREATE TABLE rsvp_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  attendance_status TEXT NOT NULL DEFAULT 'attending',
  party_size INTEGER NOT NULL,
  dietary_restrictions TEXT,
  plus_one BOOLEAN DEFAULT false,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE rsvp_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public to insert RSVP responses
CREATE POLICY "Allow public to insert rsvp_responses" ON rsvp_responses
  FOR INSERT WITH CHECK (true);

-- Create policy to allow authenticated users to read all RSVP responses
CREATE POLICY "Allow authenticated users to read rsvp_responses" ON rsvp_responses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update RSVP responses
CREATE POLICY "Allow authenticated users to update rsvp_responses" ON rsvp_responses
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete RSVP responses
CREATE POLICY "Allow authenticated users to delete rsvp_responses" ON rsvp_responses
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create faqs table
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Create policies for faqs table
CREATE POLICY "Allow authenticated users to read faqs" ON faqs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert faqs" ON faqs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update faqs" ON faqs
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete faqs" ON faqs
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create custom_invites table for personalized invitation URLs
CREATE TABLE custom_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invite_code TEXT NOT NULL UNIQUE,
  guest_name TEXT NOT NULL,
  guest_email TEXT,
  max_party_size INTEGER DEFAULT 2,
  custom_message TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE custom_invites ENABLE ROW LEVEL SECURITY;

-- Create policies for custom_invites table
CREATE POLICY "Allow authenticated users to read custom_invites" ON custom_invites
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert custom_invites" ON custom_invites
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update custom_invites" ON custom_invites
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete custom_invites" ON custom_invites
  FOR DELETE USING (auth.role() = 'authenticated');

-- Allow public to read active invites (for RSVP page access)
CREATE POLICY "Allow public to read active custom_invites" ON custom_invites
  FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));