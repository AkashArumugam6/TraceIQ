'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse, Anomaly } from '@/types'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { 
  BellIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor } from '@/lib/utils/severity'

interface Notification extends Anomaly {
  isRead: boolean
  notificationId: string
}

export function NotificationCenter({ onClose }: { onClose: () => void }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const { data, loading } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 20, offset: 0 }
  })

  // Initialize notifications from anomalies
  useEffect(() => {
    if (data?.anomalies?.anomalies) {
      const recentAnomalies = data.anomalies.anomalies.slice(0, 20)
      const notificationList: Notification[] = recentAnomalies.map(anomaly => ({
        ...anomaly,
        isRead: false,
        notificationId: `notif-${anomaly.id}`
      }))
      
      setNotifications(notificationList)
      setUnreadCount(notificationList.length)
    }
  }, [data])

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.notificationId === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    )
    setUnreadCount(0)
  }

  const getNotificationIcon = (severity: string) => {
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

  const getNotificationTitle = (anomaly: Anomaly) => {
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

  // Group notifications by severity
  const groupedNotifications = notifications.reduce((acc, notification) => {
    const severity = notification.severity.toUpperCase()
    if (!acc[severity]) {
      acc[severity] = []
    }
    acc[severity].push(notification)
    return acc
  }, {} as Record<string, Notification[]>)

  const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25 dark:bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs"
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  You're all caught up! New anomalies will appear here.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-6">
                {severityOrder.map(severity => {
                  const severityNotifications = groupedNotifications[severity] || []
                  if (severityNotifications.length === 0) return null

                  return (
                    <div key={severity}>
                      <div className="flex items-center space-x-2 mb-3">
                        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                          {severity.toLowerCase()}
                        </h3>
                        <Badge 
                          className={`${getSeverityColor(severity)} font-semibold px-2 py-1 rounded-full text-xs`}
                        >
                          {severityNotifications.length}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {severityNotifications.map((notification) => (
                          <div
                            key={notification.notificationId}
                            className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                              notification.isRead 
                                ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                                : 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 shadow-sm'
                            }`}
                            onClick={() => markAsRead(notification.notificationId)}
                          >
                            <div className="flex items-start space-x-3">
                              {/* Icon */}
                              <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.severity)}
                              </div>
                              
                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${
                                  notification.isRead 
                                    ? 'text-gray-600 dark:text-gray-400' 
                                    : 'text-gray-900 dark:text-white'
                                }`}>
                                  {getNotificationTitle(notification)}
                                </p>
                                <p className={`text-xs mt-1 ${
                                  notification.isRead 
                                    ? 'text-gray-500 dark:text-gray-500' 
                                    : 'text-gray-600 dark:text-gray-400'
                                }`}>
                                  {notification.reason}
                                </p>
                                <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="font-mono">{notification.ip}</span>
                                  <span>•</span>
                                  <span>{formatTimestamp(notification.timestamp)}</span>
                                </div>
                              </div>
                              
                              {/* Unread indicator */}
                              {!notification.isRead && (
                                <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Showing last 20 anomalies
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
