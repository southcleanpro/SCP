import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export type UserRole = 'client' | 'sales_associate' | 'team_member' | 'administrator'

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  full_name: string
  phone?: string
  created_at: string
  approved: boolean
}