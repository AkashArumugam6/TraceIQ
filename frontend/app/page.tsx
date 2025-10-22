import { DashboardStats } from '@/components/DashboardStats'
import { AnomaliesTable } from '@/components/AnomaliesTable'
import { AiInsightCard } from '@/components/AiInsightCard'
import { LogIngestForm } from '@/components/LogIngestForm'

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
              Security Dashboard
            </h1>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
              Real-time anomaly detection and AI-powered security insights
            </p>
          </div>
          <div className="hidden sm:flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">Just now</div>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Anomalies Table - Takes 2 columns */}
        <div className="xl:col-span-2">
          <AnomaliesTable />
        </div>

        {/* AI Insights - Takes 1 column */}
        <div className="space-y-6">
          <AiInsightCard />
          <LogIngestForm />
        </div>
      </div>
    </div>
  )
}
