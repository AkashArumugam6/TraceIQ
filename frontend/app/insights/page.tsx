'use client'

import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES, GET_AI_SUMMARY } from '@/lib/graphql/queries'
import { GetAnomaliesResponse, GetAiSummaryResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { RiskGauge } from '@/components/RiskGauge'
import { ThreatTimeline } from '@/components/ThreatTimeline'
import { formatTimeAgo } from '@/lib/utils/format'
import { getSeverityColor } from '@/lib/utils/severity'
import { 
  SparklesIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { Anomaly } from '@/types'

export default function InsightsPage() {
  const { data: anomaliesData, loading: anomaliesLoading } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES)
  const { data: aiData, loading: aiLoading } = useQuery<GetAiSummaryResponse>(GET_AI_SUMMARY)

  if (anomaliesLoading || aiLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Insights
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AI-powered security analysis and insights
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Threat Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const anomalies: Anomaly[] = anomaliesData?.anomalies || []
  const aiSummary = aiData?.aiAnalysisSummary

  // Filter AI-detected anomalies
  const aiAnomalies = anomalies.filter(a => 
    a.detectionSource === 'AI' || a.detectionSource === 'HYBRID'
  )

  // Get severity distribution
  const severityDistribution = anomalies.reduce((acc, anomaly) => {
    const severity = anomaly.severity.toUpperCase()
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Get detection source distribution
  const detectionDistribution = anomalies.reduce((acc, anomaly) => {
    acc[anomaly.detectionSource] = (acc[anomaly.detectionSource] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          AI Insights
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          AI-powered security analysis and insights
        </p>
      </div>

      {/* Risk Assessment and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              <span>Risk Assessment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <RiskGauge value={aiSummary?.overallRiskScore || 0} size="lg" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aiSummary?.totalAiAnomalies || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  AI Detected
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {aiSummary?.attackPatternsDetected?.length || 0}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Attack Patterns
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Last analysis: {aiSummary?.lastAnalysisTime ? formatTimeAgo(aiSummary.lastAnalysisTime) : 'Never'}
            </div>
          </CardContent>
        </Card>

        {/* Threat Timeline */}
        <ThreatTimeline />
      </div>

      {/* AI Analysis Summary */}
      {aiSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Top Threats */}
          {aiSummary.topThreats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                  <span>Top Threats</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiSummary.topThreats.map((threat, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {index + 1}.
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {threat}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attack Patterns */}
          {aiSummary.attackPatternsDetected.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  <span>Attack Patterns</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {aiSummary.attackPatternsDetected.map((pattern, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      {pattern}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
              <span>Severity Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(severityDistribution).map(([severity, count]) => (
                <div key={severity} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(severity)}>
                      {severity}
                    </Badge>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detection Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span>Detection Sources</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(detectionDistribution).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {source === 'RULE' && <ShieldCheckIcon className="h-4 w-4 text-blue-600" />}
                    {source === 'AI' && <SparklesIcon className="h-4 w-4 text-purple-600" />}
                    {source === 'HYBRID' && <BoltIcon className="h-4 w-4 text-orange-600" />}
                    <span className="text-sm text-gray-900 dark:text-white">
                      {source}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI-Detected Anomalies */}
      {aiAnomalies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              <span>AI-Detected Anomalies</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {aiAnomalies.slice(0, 10).map((anomaly) => (
                <div key={anomaly.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {anomaly.detectionSource}
                        </span>
                        {anomaly.confidenceScore && (
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            ({anomaly.confidenceScore}% confidence)
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {anomaly.reason}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                        IP: {anomaly.ip} • {formatTimeAgo(anomaly.timestamp)}
                      </p>
                      {anomaly.aiExplanation && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {anomaly.aiExplanation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
