
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest'

const DatabaseConnectionTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <Button variant="outline" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Database Connection Test</h1>
        </div>

        {/* Connection Test Component */}
        <div className="flex justify-center">
          <SupabaseConnectionTest />
        </div>

        {/* Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Connection Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Database:</strong> PostgreSQL hosted on Supabase</p>
            <p><strong>Tables Created:</strong> stations, user_profiles, employees, products, sales_reports, deliveries, licenses, SMS settings, audit logs</p>
            <p><strong>Authentication:</strong> Supabase Auth with Row Level Security</p>
            <p><strong>Storage:</strong> File storage for employee photos, documents, and receipts</p>
            <p><strong>Real-time:</strong> Live updates for collaborative features</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DatabaseConnectionTest
