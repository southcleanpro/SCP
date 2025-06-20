/*
  # Create profiles table and related schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (text, enum-like values)
      - `full_name` (text)
      - `phone` (text, nullable)
      - `created_at` (timestamp)
      - `approved` (boolean, default false)
    - `service_requests`
      - `id` (uuid, primary key)
      - `client_id` (uuid, references profiles)
      - `service_type` (text)
      - `address` (text)
      - `scheduled_date` (timestamp)
      - `status` (text, enum-like values)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `rating` (integer, nullable)
      - `feedback` (text, nullable)
    - `leads`
      - `id` (uuid, primary key)
      - `sales_associate_id` (uuid, references profiles)
      - `client_name` (text)
      - `client_phone` (text)
      - `client_address` (text)
      - `company_type` (text)
      - `status` (text, enum-like values)
      - `commission_amount` (numeric, nullable)
      - `created_at` (timestamp)
      - `notes` (text, nullable)
    - `tasks`
      - `id` (uuid, primary key)
      - `team_member_id` (uuid, references profiles, nullable)
      - `service_request_id` (uuid, references service_requests, nullable)
      - `title` (text)
      - `description` (text)
      - `address` (text)
      - `scheduled_date` (timestamp)
      - `status` (text, enum-like values)
      - `completion_photos` (text array, nullable)
      - `completion_notes` (text, nullable)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for different user roles (client, sales_associate, team_member, administrator)

  3. Functions
    - Create function to handle user registration and profile creation
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'sales_associate', 'team_member', 'administrator')),
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  approved boolean DEFAULT false
);

-- Create service_requests table
CREATE TABLE IF NOT EXISTS service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_type text NOT NULL,
  address text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz DEFAULT now(),
  rating integer CHECK (rating >= 1 AND rating <= 5),
  feedback text
);

-- Create leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_associate_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_phone text NOT NULL,
  client_address text NOT NULL,
  company_type text NOT NULL,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'contacted', 'contract_signed', 'service_started', 'commission_paid')),
  commission_amount numeric(10,2),
  created_at timestamptz DEFAULT now(),
  notes text
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  service_request_id uuid REFERENCES service_requests(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL,
  address text NOT NULL,
  scheduled_date timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed')),
  completion_photos text[],
  completion_notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Administrators can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

CREATE POLICY "Administrators can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

-- Service requests policies
CREATE POLICY "Clients can manage own service requests"
  ON service_requests
  FOR ALL
  TO authenticated
  USING (client_id = auth.uid());

CREATE POLICY "Team members and admins can read all service requests"
  ON service_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('team_member', 'administrator')
    )
  );

CREATE POLICY "Team members and admins can update service requests"
  ON service_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('team_member', 'administrator')
    )
  );

-- Leads policies
CREATE POLICY "Sales associates can manage own leads"
  ON leads
  FOR ALL
  TO authenticated
  USING (sales_associate_id = auth.uid());

CREATE POLICY "Administrators can read all leads"
  ON leads
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

CREATE POLICY "Administrators can update all leads"
  ON leads
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

-- Tasks policies
CREATE POLICY "Team members can read assigned tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (team_member_id = auth.uid());

CREATE POLICY "Team members can update assigned tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (team_member_id = auth.uid());

CREATE POLICY "Administrators can manage all tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'administrator'
    )
  );

-- Function to handle user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, full_name, approved)
  VALUES (
    NEW.id,
    NEW.email,
    'client',
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_service_requests_client_id ON service_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_leads_sales_associate_id ON leads(sales_associate_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_tasks_team_member_id ON tasks(team_member_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);