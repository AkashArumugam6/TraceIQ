'use client'

import { useState, useEffect } from 'react'
import { useQuery, useSubscription } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { ANOMALY_DETECTED_SUBSCRIPTION } from '@/lib/graphql/subscriptions'
import { GetAnomaliesResponse, Anomaly } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor } from '@/lib/utils/severity'

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Anomaly[]>([])
  const [isLive, setIsLive] = useState(true)
  
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 20, offset: 0 }
  })

  // Subscribe to real-time anomaly updates
  const { data: subscriptionData } = useSubscription(ANOMALY_DETECTED_SUBSCRIPTION)

  useEffect(() => {
    if (data?.anomalies?.anomalies) {
      setActivities(data.anomalies.anomalies.slice(0, 20))
    }
  }, [data])

  useEffect(() => {
    if (subscriptionData?.anomalyDetected) {
      const newAnomaly = subscriptionData.anomalyDetected
      setActivities(prev => [newAnomaly, ...prev.slice(0, 19)])
    }
  }, [subscriptionData])

  const toggleLive = () => {
    setIsLive(!isLive)
  }

  const refreshActivities = () => {
    window.location.reload()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Activity Feed</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Unable to load activity feed
          </div>
        </CardContent>
      </Card>
    )
  }

  const getActivityIcon = (severity: string) => {
    const severityUpper = severity.toUpperCase()
    switch (severityUpper) {
      case 'CRITICAL':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'HIGH':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />
      case 'MEDIUM':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'LOW':
        return <ExclamationTriangleIcon className="h-5 w-5 text-green-500" />
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityDescription = (anomaly: Anomaly) => {
    const severity = anomaly.severity.toUpperCase()
    const source = anomaly.detectionSource || 'RULE'
    
    switch (source) {
      case 'AI':
        return `AI detected ${severity.toLowerCase()} anomaly`
      case 'HYBRID':
        return `Hybrid system detected ${severity.toLowerCase()} anomaly`
      case 'RULE':
      default:
        return `Rule-based detection found ${severity.toLowerCase()} anomaly`
    }
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Activity Feed</span>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {isLive ? 'Live' : 'Paused'}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <ClockIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No recent activity
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Activity will appear here as anomalies are detected
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshActivities}
              className="flex items-center space-x-2"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Activity Feed</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isLive ? 'Live' : 'Paused'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLive}
              className="ml-2"
            >
              {isLive ? 'Pause' : 'Resume'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.map((activity, index) => (
            <div
              key={`${activity.id}-${index}`}
              className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.severity)}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {getActivityDescription(activity)}
                  </p>
                  <Badge 
                    className={`${getSeverityColor(activity.severity)} font-semibold px-2 py-1 rounded-full text-xs`}
                  >
                    {activity.severity}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {activity.reason}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-mono">{activity.ip}</span>
                  <span>{formatTimestamp(activity.timestamp)}</span>
                  {activity.detectionSource && (
                    <span className="capitalize">{activity.detectionSource.toLowerCase()}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Showing last {activities.length} activities</span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshActivities}
              className="flex items-center space-x-1"
            >
              <ArrowPathIcon className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
