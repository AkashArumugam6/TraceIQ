'use client'

import { useEffect } from 'react'
import { useSubscription } from '@apollo/client/react'
import { ANOMALY_DETECTED } from '@/lib/graphql/subscriptions'
import { AnomalyDetectedResponse } from '@/types'
import { toast } from 'react-hot-toast'
import { getSeverityColor } from '@/lib/utils/severity'
import { formatTimeAgo } from '@/lib/utils/format'
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BoltIcon
} from '@heroicons/react/24/outline'
import { Anomaly } from '@/types'

const getDetectionIcon = (source: string) => {
  switch (source) {
    case 'RULE':
      return <ShieldCheckIcon className="h-4 w-4" />
    case 'AI':
      return <SparklesIcon className="h-4 w-4" />
    case 'HYBRID':
      return <BoltIcon className="h-4 w-4" />
    default:
      return <ShieldCheckIcon className="h-4 w-4" />
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

export function RealtimeMonitor() {
  const { data, error } = useSubscription<AnomalyDetectedResponse>(ANOMALY_DETECTED)

  useEffect(() => {
    if (data?.anomalyDetected) {
      const anomaly: Anomaly = data.anomalyDetected
      
      // Show toast notification
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className={`h-6 w-6 ${getSeverityColor(anomaly.severity).split(' ')[1]}`} />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New {anomaly.severity} Anomaly Detected
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {anomaly.reason}
                </p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {anomaly.ip}
                  </span>
                  <span className={`text-xs ${getDetectionColor(anomaly.detectionSource)}`}>
                    {getDetectionIcon(anomaly.detectionSource)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTimeAgo(anomaly.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200 dark:border-gray-700">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      ), {
        duration: 8000,
        position: 'top-right',
      })

      // Play sound for critical anomalies
      if (anomaly.severity.toUpperCase() === 'CRITICAL') {
        // You can add a sound notification here
        console.log('🔔 Critical anomaly detected!')
      }
    }
  }, [data])

  useEffect(() => {
    if (error) {
      console.error('Subscription error:', error)
      toast.error('Connection to real-time updates lost')
    }
  }, [error])

  // This component doesn't render anything visible
  return null
}
