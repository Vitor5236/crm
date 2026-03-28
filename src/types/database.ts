export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  client_id: string;
  scheduled_date: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
  client?: Client;
}

export interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  interest: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
}

export interface SatisfactionSurvey {
  id: string;
  client_id: string;
  visit_id: string | null;
  rating: number;
  feedback: string | null;
  created_at: string;
  client?: Client;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  category: string | null;
  active: boolean;
  created_at: string;
}

export interface Warranty {
  id: string;
  client_id: string;
  service_id: string | null;
  start_date: string;
  end_date: string;
  status: string;
  description: string | null;
  created_at: string;
  client?: Client;
  service?: Service;
}

export interface MaintenancePlan {
  id: string;
  client_id: string;
  name: string;
  frequency_days: number;
  last_maintenance: string | null;
  next_maintenance: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  client?: Client;
}

export interface DiscountPolicy {
  id: string;
  name: string;
  type: string;
  value: number;
  min_purchase: number;
  start_date: string | null;
  end_date: string | null;
  active: boolean;
  created_at: string;
}

export interface MessageTemplate {
  id: string;
  name: string;
  type: string;
  content: string;
  variables: string[];
  active: boolean;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface LoyaltyProgram {
  id: string;
  client_id: string;
  points: number;
  tier: string;
  created_at: string;
  updated_at: string;
  client?: Client;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      clients: { Row: Client; Insert: Omit<Client, 'id' | 'created_at' | 'updated_at'>; Update: Partial<Client> };
      visits: { Row: Visit; Insert: Omit<Visit, 'id' | 'created_at'>; Update: Partial<Visit> };
      leads: { Row: Lead; Insert: Omit<Lead, 'id' | 'created_at'>; Update: Partial<Lead> };
      satisfaction_surveys: { Row: SatisfactionSurvey; Insert: Omit<SatisfactionSurvey, 'id' | 'created_at'>; Update: Partial<SatisfactionSurvey> };
      services: { Row: Service; Insert: Omit<Service, 'id' | 'created_at'>; Update: Partial<Service> };
      warranties: { Row: Warranty; Insert: Omit<Warranty, 'id' | 'created_at'>; Update: Partial<Warranty> };
      maintenance_plans: { Row: MaintenancePlan; Insert: Omit<MaintenancePlan, 'id' | 'created_at'>; Update: Partial<MaintenancePlan> };
      discount_policies: { Row: DiscountPolicy; Insert: Omit<DiscountPolicy, 'id' | 'created_at'>; Update: Partial<DiscountPolicy> };
      message_templates: { Row: MessageTemplate; Insert: Omit<MessageTemplate, 'id' | 'created_at'>; Update: Partial<MessageTemplate> };
      activity_logs: { Row: ActivityLog; Insert: Omit<ActivityLog, 'id' | 'created_at'>; Update: Partial<ActivityLog> };
      loyalty_programs: { Row: LoyaltyProgram; Insert: Omit<LoyaltyProgram, 'id' | 'created_at' | 'updated_at'>; Update: Partial<LoyaltyProgram> };
      app_users: { Row: AppUser; Insert: Omit<AppUser, 'id' | 'created_at' | 'updated_at'>; Update: Partial<AppUser> };
    };
  };
}
