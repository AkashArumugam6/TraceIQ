'use client'

import { Modal } from './ui/Modal'
import { Badge } from './ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor, getSeverityIconColor } from '@/lib/utils/severity'
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  BoltIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import { Anomaly } from '@/types'

interface AnomalyDetailsModalProps {
  anomaly: Anomaly
  isOpen: boolean
  onClose: () => void
}

const getDetectionIcon = (source: string) => {
  switch (source) {
    case 'RULE':
      return <ShieldCheckIcon className="h-5 w-5" />
    case 'AI':
      return <SparklesIcon className="h-5 w-5" />
    case 'HYBRID':
      return <BoltIcon className="h-5 w-5" />
    default:
      return <ShieldCheckIcon className="h-5 w-5" />
  }
}

const getDetectionColor = (source: string) => {
  switch (source) {
    case 'RULE':
      return 'text-blue-600'
    case 'AI':
      return 'text-purple-600'
    case 'HYBRID':
      return 'text-orange-600'
    default:
      return 'text-gray-600'
  }
}

export function AnomalyDetailsModal({ anomaly, isOpen, onClose }: AnomalyDetailsModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${getSeverityIconColor(anomaly.severity)} bg-gray-100 dark:bg-gray-700`}>
              <ExclamationTriangleIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {anomaly.reason}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Detected at {formatTimestamp(anomaly.timestamp)}
              </p>
            </div>
          </div>
          <Badge className={getSeverityColor(anomaly.severity)}>
            {anomaly.severity}
          </Badge>
        </div>

        {/* Detection Source */}
        <div className="flex items-center space-x-2">
          <span className={`${getDetectionColor(anomaly.detectionSource)}`}>
            {getDetectionIcon(anomaly.detectionSource)}
          </span>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            Detected by {anomaly.detectionSource}
          </span>
          {anomaly.confidenceScore && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              (Confidence: {anomaly.confidenceScore}%)
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  IP Address
                </label>
                <p className="text-sm text-gray-900 dark:text-white font-mono">
                  {anomaly.ip}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Detection Source
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {anomaly.detectionSource}
                </p>
              </div>
              {anomaly.logEntry && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Source System
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {anomaly.logEntry.source}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Event Type
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {anomaly.logEntry.eventType || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      User
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {anomaly.logEntry.user}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* AI Analysis */}
          {(anomaly.aiExplanation || anomaly.recommendedAction) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <span>AI Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {anomaly.aiExplanation && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <ChartBarIcon className="h-4 w-4" />
                      <span>Explanation</span>
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {anomaly.aiExplanation}
                    </p>
                  </div>
                )}
                {anomaly.recommendedAction && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center space-x-1">
                      <LightBulbIcon className="h-4 w-4" />
                      <span>Recommended Action</span>
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white mt-1">
                      {anomaly.recommendedAction}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Raw Log Entry */}
        {anomaly.logEntry && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Related Log Entry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                  {JSON.stringify(anomaly.logEntry, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  )
}

