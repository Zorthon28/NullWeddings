-- Create admin_settings table
CREATE TABLE admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  names TEXT NOT NULL DEFAULT 'Kenia y Gustavo',
  subtitle TEXT NOT NULL DEFAULT 'NOS CASAMOS',
  wedding_date TEXT NOT NULL DEFAULT '21 de noviembre, 2025',
  invitation_text TEXT NOT NULL DEFAULT 'Te invitamos a celebrar con nosotros',
  location TEXT NOT NULL DEFAULT 'TBD',
  show_countdown BOOLEAN NOT NULL DEFAULT true,
  show_rsvp BOOLEAN NOT NULL DEFAULT true,
  show_guest_book BOOLEAN NOT NULL DEFAULT true,
  show_photo_gallery BOOLEAN NOT NULL DEFAULT true,
  show_itinerary BOOLEAN NOT NULL DEFAULT true,
  show_gift_registry BOOLEAN NOT NULL DEFAULT true,
  show_accommodation BOOLEAN NOT NULL DEFAULT true,
  show_contact BOOLEAN NOT NULL DEFAULT true,
  show_background_image BOOLEAN NOT NULL DEFAULT true,
  gallery_images TEXT[] NOT NULL DEFAULT ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop'],
  background_images TEXT[] NOT NULL DEFAULT ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=1080&fit=crop', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop'],
  selected_background TEXT NOT NULL DEFAULT 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only authenticated users to access
CREATE POLICY "Allow authenticated users to access admin_settings" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for public read, authenticated write
CREATE POLICY "Allow public to read admin_settings" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to modify admin_settings" ON admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert default settings with fixed ID
INSERT INTO admin_settings (id, names, subtitle, wedding_date, invitation_text, location, show_countdown, show_rsvp, show_guest_book, show_photo_gallery, show_itinerary, show_gift_registry, show_accommodation, show_contact, show_background_image, gallery_images, background_images, selected_background)
VALUES ('main', 'Kenia y Gustavo', 'NOS CASAMOS', '21 de noviembre, 2025', 'Te invitamos a celebrar con nosotros', 'TBD', true, true, true, true, true, true, true, true, true, ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=600&fit=crop'], ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=1920&h=1080&fit=crop', 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=1920&h=1080&fit=crop'], 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1080&fit=crop')
ON CONFLICT (id) DO NOTHING;

-- Migration: Add show_background_image column if it doesn't exist
ALTER TABLE admin_settings ADD COLUMN IF NOT EXISTS show_background_image BOOLEAN NOT NULL DEFAULT true;