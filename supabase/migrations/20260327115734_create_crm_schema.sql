/*
  # CRM System Database Schema

  1. New Tables
    - `clients` - Customer information and history
      - `id` (uuid, primary key)
      - `name` (text) - Full name
      - `email` (text) - Email address
      - `phone` (text) - Phone number
      - `address` (text) - Address
      - `notes` (text) - Additional notes
      - `status` (text) - active, inactive, lead
      - `source` (text) - How they found us
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `visits` - Scheduled visits and appointments
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `scheduled_date` (timestamptz)
      - `type` (text) - diagnosis, installation, maintenance
      - `status` (text) - scheduled, completed, cancelled
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `leads` - Potential future customers
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `interest` (text)
      - `status` (text) - new, contacted, qualified, converted, lost
      - `source` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `satisfaction_surveys` - Customer satisfaction feedback
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `visit_id` (uuid, foreign key)
      - `rating` (integer) - 1-5
      - `feedback` (text)
      - `created_at` (timestamptz)
    
    - `warranties` - Product/service warranties
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `service_id` (uuid, foreign key)
      - `start_date` (date)
      - `end_date` (date)
      - `status` (text) - active, expired, claimed
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `maintenance_plans` - Preventive maintenance schedules
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `name` (text)
      - `frequency_days` (integer)
      - `last_maintenance` (date)
      - `next_maintenance` (date)
      - `status` (text) - active, paused, cancelled
      - `notes` (text)
      - `created_at` (timestamptz)
    
    - `services` - Available services and prices
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `duration_minutes` (integer)
      - `category` (text)
      - `active` (boolean)
      - `created_at` (timestamptz)
    
    - `discount_policies` - Discount rules
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - percentage, fixed
      - `value` (decimal)
      - `min_purchase` (decimal)
      - `start_date` (date)
      - `end_date` (date)
      - `active` (boolean)
      - `created_at` (timestamptz)
    
    - `message_templates` - Pre-defined message templates
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text) - whatsapp, email, sms
      - `content` (text)
      - `variables` (jsonb)
      - `active` (boolean)
      - `created_at` (timestamptz)
    
    - `activity_logs` - System activity tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `action` (text)
      - `entity_type` (text)
      - `entity_id` (uuid)
      - `details` (jsonb)
      - `created_at` (timestamptz)
    
    - `loyalty_programs` - Customer loyalty and benefits
      - `id` (uuid, primary key)
      - `client_id` (uuid, foreign key)
      - `points` (integer)
      - `tier` (text) - bronze, silver, gold, platinum
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Policies for authenticated access
*/

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  address text,
  notes text,
  status text DEFAULT 'active',
  source text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read clients"
  ON clients FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert clients"
  ON clients FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update clients"
  ON clients FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete clients"
  ON clients FOR DELETE
  TO authenticated
  USING (true);

-- Visits table
CREATE TABLE IF NOT EXISTS visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  scheduled_date timestamptz NOT NULL,
  type text NOT NULL,
  status text DEFAULT 'scheduled',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read visits"
  ON visits FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert visits"
  ON visits FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update visits"
  ON visits FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete visits"
  ON visits FOR DELETE
  TO authenticated
  USING (true);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  phone text,
  interest text,
  status text DEFAULT 'new',
  source text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update leads"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete leads"
  ON leads FOR DELETE
  TO authenticated
  USING (true);

-- Satisfaction surveys table
CREATE TABLE IF NOT EXISTS satisfaction_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  visit_id uuid REFERENCES visits(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE satisfaction_surveys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read surveys"
  ON satisfaction_surveys FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert surveys"
  ON satisfaction_surveys FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update surveys"
  ON satisfaction_surveys FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete surveys"
  ON satisfaction_surveys FOR DELETE
  TO authenticated
  USING (true);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  duration_minutes integer DEFAULT 60,
  category text,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read services"
  ON services FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

-- Warranties table
CREATE TABLE IF NOT EXISTS warranties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'active',
  description text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read warranties"
  ON warranties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert warranties"
  ON warranties FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update warranties"
  ON warranties FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete warranties"
  ON warranties FOR DELETE
  TO authenticated
  USING (true);

-- Maintenance plans table
CREATE TABLE IF NOT EXISTS maintenance_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  frequency_days integer NOT NULL DEFAULT 30,
  last_maintenance date,
  next_maintenance date,
  status text DEFAULT 'active',
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read maintenance"
  ON maintenance_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert maintenance"
  ON maintenance_plans FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update maintenance"
  ON maintenance_plans FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete maintenance"
  ON maintenance_plans FOR DELETE
  TO authenticated
  USING (true);

-- Discount policies table
CREATE TABLE IF NOT EXISTS discount_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'percentage',
  value decimal(10,2) NOT NULL DEFAULT 0,
  min_purchase decimal(10,2) DEFAULT 0,
  start_date date,
  end_date date,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE discount_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read discounts"
  ON discount_policies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert discounts"
  ON discount_policies FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update discounts"
  ON discount_policies FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete discounts"
  ON discount_policies FOR DELETE
  TO authenticated
  USING (true);

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL DEFAULT 'whatsapp',
  content text NOT NULL,
  variables jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read templates"
  ON message_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert templates"
  ON message_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update templates"
  ON message_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete templates"
  ON message_templates FOR DELETE
  TO authenticated
  USING (true);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Loyalty programs table
CREATE TABLE IF NOT EXISTS loyalty_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES clients(id) ON DELETE CASCADE UNIQUE,
  points integer DEFAULT 0,
  tier text DEFAULT 'bronze',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE loyalty_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read loyalty"
  ON loyalty_programs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert loyalty"
  ON loyalty_programs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update loyalty"
  ON loyalty_programs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete loyalty"
  ON loyalty_programs FOR DELETE
  TO authenticated
  USING (true);

-- App users table for internal user management
CREATE TABLE IF NOT EXISTS app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  role text DEFAULT 'user',
  permissions jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read app_users"
  ON app_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated insert app_users"
  ON app_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update app_users"
  ON app_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated delete app_users"
  ON app_users FOR DELETE
  TO authenticated
  USING (true);