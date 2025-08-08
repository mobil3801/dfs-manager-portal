
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nehhjsiuhthflfwkfequ.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5laGhqc2l1aHRoZmxmd2tmZXF1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzAxMzE3NSwiZXhwIjoyMDY4NTg5MTc1fQ.7naT6l_oNH8VI5MaEKgJ19PoYw1EErv6-ftkEin12wE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      stations: {
        Row: {
          id: string
          name: string
          address: string | null
          phone: string | null
          manager_name: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          phone?: string | null
          manager_name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          phone?: string | null
          manager_name?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          station_id: string | null
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          station_id?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          station_id?: string | null
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          station_id: string | null
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          position: string | null
          hire_date: string | null
          salary: number | null
          status: string
          profile_picture_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          station_id?: string | null
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          salary?: number | null
          status?: string
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          station_id?: string | null
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          position?: string | null
          hire_date?: string | null
          salary?: number | null
          status?: string
          profile_picture_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          station_id: string | null
          name: string
          category: string | null
          sku: string | null
          price: number | null
          cost: number | null
          quantity_in_stock: number
          minimum_stock_level: number
          supplier: string | null
          description: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          station_id?: string | null
          name: string
          category?: string | null
          sku?: string | null
          price?: number | null
          cost?: number | null
          quantity_in_stock?: number
          minimum_stock_level?: number
          supplier?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          station_id?: string | null
          name?: string
          category?: string | null
          sku?: string | null
          price?: number | null
          cost?: number | null
          quantity_in_stock?: number
          minimum_stock_level?: number
          supplier?: string | null
          description?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sales_reports: {
        Row: {
          id: string
          station_id: string | null
          report_date: string
          shift: string
          total_sales: number
          cash_sales: number
          card_sales: number
          fuel_sales: number
          merchandise_sales: number
          lottery_sales: number
          expenses: number
          cash_collected: number
          reported_by: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          station_id?: string | null
          report_date: string
          shift?: string
          total_sales?: number
          cash_sales?: number
          card_sales?: number
          fuel_sales?: number
          merchandise_sales?: number
          lottery_sales?: number
          expenses?: number
          cash_collected?: number
          reported_by?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          station_id?: string | null
          report_date?: string
          shift?: string
          total_sales?: number
          cash_sales?: number
          card_sales?: number
          fuel_sales?: number
          merchandise_sales?: number
          lottery_sales?: number
          expenses?: number
          cash_collected?: number
          reported_by?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deliveries: {
        Row: {
          id: string
          station_id: string | null
          delivery_date: string
          supplier: string | null
          product_type: string | null
          quantity: number | null
          unit: string | null
          total_cost: number | null
          delivery_receipt_url: string | null
          received_by: string | null
          status: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          station_id?: string | null
          delivery_date: string
          supplier?: string | null
          product_type?: string | null
          quantity?: number | null
          unit?: string | null
          total_cost?: number | null
          delivery_receipt_url?: string | null
          received_by?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          station_id?: string | null
          delivery_date?: string
          supplier?: string | null
          product_type?: string | null
          quantity?: number | null
          unit?: string | null
          total_cost?: number | null
          delivery_receipt_url?: string | null
          received_by?: string | null
          status?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      licenses: {
        Row: {
          id: string
          station_id: string | null
          license_type: string
          license_number: string | null
          issuing_authority: string | null
          issue_date: string | null
          expiry_date: string
          status: string
          document_url: string | null
          renewal_cost: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          station_id?: string | null
          license_type: string
          license_number?: string | null
          issuing_authority?: string | null
          issue_date?: string | null
          expiry_date: string
          status?: string
          document_url?: string | null
          renewal_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          station_id?: string | null
          license_type?: string
          license_number?: string | null
          issuing_authority?: string | null
          issue_date?: string | null
          expiry_date?: string
          status?: string
          document_url?: string | null
          renewal_cost?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Storage bucket name
export const STORAGE_BUCKET = 'dfs-manager-files'

// Helper functions
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options?: { upsert?: boolean }
) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, options)
  
  if (error) throw error
  return data
}

export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const downloadFile = async (bucket: string, path: string) => {
  const { data, error } = await supabase.storage.from(bucket).download(path)
  if (error) throw error
  return data
}
