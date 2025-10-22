'use client'

import { useQuery } from '@apollo/client/react'
import { GET_AI_SUMMARY } from '@/lib/graphql/queries'
import { GetAiSummaryResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { LoadingSkeleton } from './ui/LoadingSkeleton'
import { RiskGauge } from './RiskGauge'
import { formatTimeAgo } from '@/lib/utils/format'
import { 
  SparklesIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export function AiInsightCard() {
  const { data, loading, error } = useQuery<GetAiSummaryResponse>(GET_AI_SUMMARY)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <LoadingSkeleton className="h-32 w-full" />
            <LoadingSkeleton className="h-4 w-3/4" />
            <LoadingSkeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights</span>
              <div className="text-sm text-gray-500 dark:text-gray-400">Powered by Machine Learning</div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unable to load AI insights
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error.message.includes('Failed to fetch') 
                ? 'Please check if the backend server is running on port 4000'
                : error.message
              }
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const aiSummary = data?.aiAnalysisSummary

  if (!aiSummary) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <span>AI Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No AI analysis available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">AI Insights</span>
            <div className="text-sm text-gray-500 dark:text-gray-400">Powered by Machine Learning</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {/* Risk Gauge */}
        <div className="flex justify-center">
          <RiskGauge value={aiSummary.overallRiskScore} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {aiSummary.totalAiAnomalies}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              AI Detected
            </div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {aiSummary.attackPatternsDetected.length}
            </div>
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Attack Patterns
            </div>
          </div>
        </div>

        {/* Top Threats */}
        {aiSummary.topThreats.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <div className="p-1 bg-red-100 dark:bg-red-900/20 rounded">
                <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              <span>Top Threats</span>
            </h4>
            <div className="space-y-2">
              {aiSummary.topThreats.slice(0, 3).map((threat, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                  <span>{threat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attack Patterns */}
        {aiSummary.attackPatternsDetected.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
              <div className="p-1 bg-purple-100 dark:bg-purple-900/20 rounded">
                <ChartBarIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span>Attack Patterns</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {aiSummary.attackPatternsDetected.map((pattern, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 dark:from-purple-900/30 dark:to-indigo-900/30 dark:text-purple-200 border border-purple-200 dark:border-purple-700"
                >
                  {pattern}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last Analysis */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Last analysis</span>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {formatTimeAgo(aiSummary.lastAnalysisTime)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
