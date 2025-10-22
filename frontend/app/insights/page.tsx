'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client/react'
import { GET_ANOMALIES, GET_AI_SUMMARY } from '@/lib/graphql/queries'
import { TRIGGER_AI_ANALYSIS } from '@/lib/graphql/mutations'
import { GetAnomaliesResponse, GetAiSummaryResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
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
  BoltIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { Anomaly } from '@/types'
import toast from 'react-hot-toast'

export default function InsightsPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisHistory, setAnalysisHistory] = useState([
    { id: 1, timestamp: new Date().toISOString(), status: 'completed', riskScore: 75, anomaliesFound: 12 },
    { id: 2, timestamp: new Date(Date.now() - 3600000).toISOString(), status: 'completed', riskScore: 68, anomaliesFound: 8 },
    { id: 3, timestamp: new Date(Date.now() - 7200000).toISOString(), status: 'completed', riskScore: 82, anomaliesFound: 15 }
  ])

  const { data: anomaliesData, loading: anomaliesLoading, refetch: refetchAnomalies } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES)
  const { data: aiData, loading: aiLoading, refetch: refetchAI } = useQuery<GetAiSummaryResponse>(GET_AI_SUMMARY)
  
  const [triggerAiAnalysis] = useMutation(TRIGGER_AI_ANALYSIS)

  const handleManualAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const result = await triggerAiAnalysis()
      if (result.data?.triggerAiAnalysis?.success) {
        toast.success('AI analysis triggered successfully')
        // Add to history
        setAnalysisHistory(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          status: 'completed',
          riskScore: aiData?.aiAnalysisSummary?.overallRiskScore || 0,
          anomaliesFound: anomaliesData?.anomalies?.anomalies?.filter(a => a.detectionSource === 'AI' || a.detectionSource === 'HYBRID').length || 0
        }, ...prev.slice(0, 9)])
        // Refetch data
        await Promise.all([refetchAnomalies(), refetchAI()])
      } else {
        toast.error('Failed to trigger AI analysis')
      }
    } catch (error) {
      console.error('Error triggering AI analysis:', error)
      toast.error('Failed to trigger AI analysis')
    } finally {
      setIsAnalyzing(false)
    }
  }

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

  const anomalies: Anomaly[] = anomaliesData?.anomalies?.anomalies || []
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI Insights
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            AI-powered security analysis and insights
          </p>
        </div>
        <Button
          onClick={handleManualAnalysis}
          disabled={isAnalyzing}
          className="flex items-center space-x-2"
        >
          {isAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <PlayIcon className="h-4 w-4" />
              <span>Manual Analysis</span>
            </>
          )}
        </Button>
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

      {/* AI Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            <span>Analysis History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysisHistory.map((analysis, index) => (
              <div key={analysis.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {analysis.status === 'completed' ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    ) : analysis.status === 'failed' ? (
                      <XCircleIcon className="h-6 w-6 text-red-500" />
                    ) : (
                      <ClockIcon className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Analysis #{analysisHistory.length - index}
                      </span>
                      <Badge 
                        className={`${
                          analysis.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' :
                          analysis.status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                        } font-semibold px-2 py-1 rounded-full text-xs`}
                      >
                        {analysis.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeAgo(analysis.timestamp)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {analysis.riskScore}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Risk Score
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {analysis.anomaliesFound}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Anomalies
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* High Confidence AI Detections Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SparklesIcon className="h-5 w-5 text-purple-600" />
            <span>High Confidence AI Detections</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {aiAnomalies
              .filter(anomaly => (anomaly.confidenceScore || 0) > 70)
              .slice(0, 5)
              .map((anomaly) => (
                <div key={anomaly.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity}
                        </Badge>
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                          {anomaly.confidenceScore}% confidence
                        </Badge>
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
            {aiAnomalies.filter(anomaly => (anomaly.confidenceScore || 0) > 70).length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <SparklesIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No high-confidence AI detections found</p>
                <p className="text-sm mt-2">Try running a manual analysis to detect new threats</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
