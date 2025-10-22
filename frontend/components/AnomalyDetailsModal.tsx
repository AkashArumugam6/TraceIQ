'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { UPDATE_ANOMALY_STATUS } from '@/lib/graphql/mutations'
import { Modal } from './ui/Modal'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor, getSeverityIconColor } from '@/lib/utils/severity'
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  BoltIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { Anomaly } from '@/types'
import toast from 'react-hot-toast'

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
  const [showResolutionForm, setShowResolutionForm] = useState(false)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const [updateAnomalyStatus] = useMutation(UPDATE_ANOMALY_STATUS)

  const handleStatusUpdate = async (status: string, notes?: string) => {
    setIsUpdating(true)
    try {
      await updateAnomalyStatus({
        variables: {
          id: anomaly.id,
          status,
          resolutionNotes: notes,
          resolvedBy: 'Current User' // In a real app, this would come from auth context
        }
      })
      
      toast.success(`Anomaly marked as ${status.toLowerCase().replace('_', ' ')}`)
      setShowResolutionForm(false)
      setResolutionNotes('')
      onClose() // Close modal to refresh data
    } catch (error) {
      console.error('Error updating anomaly status:', error)
      toast.error('Failed to update anomaly status')
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      OPEN: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: ExclamationTriangleIcon },
      INVESTIGATING: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: ClockIcon },
      FALSE_POSITIVE: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300', icon: XCircleIcon },
      RESOLVED: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: CheckCircleIcon }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.OPEN
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} font-semibold px-3 py-1 rounded-full text-xs flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{status.replace('_', ' ')}</span>
      </Badge>
    )
  }

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
          <div className="flex items-center space-x-3">
            {getStatusBadge(anomaly.status)}
            <Badge className={getSeverityColor(anomaly.severity)}>
              {anomaly.severity}
            </Badge>
          </div>
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

        {/* Action Buttons */}
        {anomaly.status === 'OPEN' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('INVESTIGATING')}
                  disabled={isUpdating}
                  className="flex items-center space-x-2"
                >
                  <ClockIcon className="h-4 w-4" />
                  <span>Mark as Investigating</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('FALSE_POSITIVE')}
                  disabled={isUpdating}
                  className="flex items-center space-x-2"
                >
                  <XCircleIcon className="h-4 w-4" />
                  <span>Mark as False Positive</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowResolutionForm(true)}
                  disabled={isUpdating}
                  className="flex items-center space-x-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Resolve</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resolution Form */}
        {showResolutionForm && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resolve Anomaly</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Resolution Notes
                </label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how this anomaly was resolved..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleStatusUpdate('RESOLVED', resolutionNotes)}
                  disabled={isUpdating}
                  className="flex items-center space-x-2"
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Confirm Resolution</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowResolutionForm(false)
                    setResolutionNotes('')
                  }}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Status History */}
        {(anomaly.resolvedAt || anomaly.resolvedBy) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resolution Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {anomaly.resolvedAt && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Resolved at: {formatTimestamp(anomaly.resolvedAt)}
                  </span>
                </div>
              )}
              {anomaly.resolvedBy && (
                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Resolved by: {anomaly.resolvedBy}
                  </span>
                </div>
              )}
              {anomaly.resolutionNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Resolution Notes
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    {anomaly.resolutionNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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

