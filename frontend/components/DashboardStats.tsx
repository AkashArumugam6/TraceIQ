'use client'

import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES, GET_AI_SUMMARY } from '@/lib/graphql/queries'
import { GetAnomaliesResponse, GetAiSummaryResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { LoadingSkeleton } from './ui/LoadingSkeleton'
import { formatTimeAgo } from '@/lib/utils/format'
import { 
  ExclamationTriangleIcon, 
  ShieldExclamationIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export function DashboardStats() {
  const { data: anomaliesData, loading: anomaliesLoading } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES)
  const { data: aiData, loading: aiLoading } = useQuery<GetAiSummaryResponse>(GET_AI_SUMMARY)

  if (anomaliesLoading || aiLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-8 w-16 mb-2" />
              <LoadingSkeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const anomalies = anomaliesData?.anomalies?.anomalies || []
  const aiSummary = aiData?.aiAnalysisSummary

  const criticalAnomalies = anomalies.filter(a => a.severity.toUpperCase() === 'CRITICAL').length
  const totalAnomalies = anomalies.length
  const riskScore = aiSummary?.overallRiskScore || 0
  const lastAnalysis = aiSummary?.lastAnalysisTime

  const stats = [
    {
      title: 'Total Anomalies',
      value: totalAnomalies,
      description: 'All detected anomalies',
      icon: ExclamationTriangleIcon,
      color: 'text-blue-600',
    },
    {
      title: 'Critical Issues',
      value: criticalAnomalies,
      description: 'Require immediate attention',
      icon: ShieldExclamationIcon,
      color: 'text-red-600',
    },
    {
      title: 'Risk Score',
      value: `${riskScore}%`,
      description: 'Overall system risk level',
      icon: ChartBarIcon,
      color: riskScore > 70 ? 'text-red-600' : riskScore > 40 ? 'text-yellow-600' : 'text-green-600',
    },
    {
      title: 'Last Analysis',
      value: lastAnalysis ? formatTimeAgo(lastAnalysis) : 'Never',
      description: 'AI analysis timestamp',
      icon: ClockIcon,
      color: 'text-gray-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="group hover:shadow-lg transition-all duration-200 border-0 bg-white dark:bg-gray-800 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-700 group-hover:scale-110 transition-transform duration-200`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {stat.value}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {stat.description}
            </p>
            <div className="mt-3 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  stat.title === 'Risk Score' 
                    ? riskScore > 70 
                      ? 'bg-gradient-to-r from-red-500 to-red-600' 
                      : riskScore > 40 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                        : 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600'
                }`}
                style={{ 
                  width: stat.title === 'Risk Score' 
                    ? `${Math.min(riskScore, 100)}%` 
                    : stat.title === 'Total Anomalies' 
                      ? `${Math.min((totalAnomalies / 10) * 100, 100)}%`
                      : stat.title === 'Critical Issues'
                        ? `${Math.min((criticalAnomalies / 5) * 100, 100)}%`
                        : '100%'
                }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
