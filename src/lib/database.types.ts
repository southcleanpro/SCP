export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'client' | 'sales_associate' | 'team_member' | 'administrator'
          full_name: string
          phone: string | null
          created_at: string
          approved: boolean
        }
        Insert: {
          id: string
          email: string
          role: 'client' | 'sales_associate' | 'team_member' | 'administrator'
          full_name: string
          phone?: string | null
          created_at?: string
          approved?: boolean
        }
        Update: {
          id?: string
          email?: string
          role?: 'client' | 'sales_associate' | 'team_member' | 'administrator'
          full_name?: string
          phone?: string | null
          created_at?: string
          approved?: boolean
        }
      }
      service_requests: {
        Row: {
          id: string
          client_id: string
          service_type: string
          address: string
          scheduled_date: string
          status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          rating: number | null
          feedback: string | null
        }
        Insert: {
          id?: string
          client_id: string
          service_type: string
          address: string
          scheduled_date: string
          status?: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          rating?: number | null
          feedback?: string | null
        }
        Update: {
          id?: string
          client_id?: string
          service_type?: string
          address?: string
          scheduled_date?: string
          status?: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          rating?: number | null
          feedback?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          sales_associate_id: string
          client_name: string
          client_phone: string
          client_address: string
          company_type: string
          status: 'sent' | 'contacted' | 'contract_signed' | 'service_started' | 'commission_paid'
          commission_amount: number | null
          created_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          sales_associate_id: string
          client_name: string
          client_phone: string
          client_address: string
          company_type: string
          status?: 'sent' | 'contacted' | 'contract_signed' | 'service_started' | 'commission_paid'
          commission_amount?: number | null
          created_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          sales_associate_id?: string
          client_name?: string
          client_phone?: string
          client_address?: string
          company_type?: string
          status?: 'sent' | 'contacted' | 'contract_signed' | 'service_started' | 'commission_paid'
          commission_amount?: number | null
          created_at?: string
          notes?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          team_member_id: string | null
          service_request_id: string | null
          title: string
          description: string
          address: string
          scheduled_date: string
          status: 'assigned' | 'in_progress' | 'completed'
          completion_photos: string[] | null
          completion_notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_member_id?: string | null
          service_request_id?: string | null
          title: string
          description: string
          address: string
          scheduled_date: string
          status?: 'assigned' | 'in_progress' | 'completed'
          completion_photos?: string[] | null
          completion_notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          team_member_id?: string | null
          service_request_id?: string | null
          title?: string
          description?: string
          address?: string
          scheduled_date?: string
          status?: 'assigned' | 'in_progress' | 'completed'
          completion_photos?: string[] | null
          completion_notes?: string | null
          created_at?: string
        }
      }
    }
  }
}