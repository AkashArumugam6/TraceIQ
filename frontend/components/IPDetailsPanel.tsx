'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES, GET_LOGS_BY_IP } from '@/lib/graphql/queries'
import { GetAnomaliesResponse, GetLogsByIpResponse, Anomaly, LogEntry } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'
import { 
  XMarkIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor } from '@/lib/utils/severity'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface IPDetailsPanelProps {
  ip: string
  isOpen: boolean
  onClose: () => void
}

export function IPDetailsPanel({ ip, isOpen, onClose }: IPDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'logs' | 'anomalies' | 'timeline'>('overview')
  const [logsPage, setLogsPage] = useState(0)
  const [anomaliesPage, setAnomaliesPage] = useState(0)
  const [showWhoisModal, setShowWhoisModal] = useState(false)
  const [showThreatIntelModal, setShowThreatIntelModal] = useState(false)

  const { data: anomaliesData, loading: anomaliesLoading } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 1000, offset: 0 }
  })

  const { data: logsData, loading: logsLoading } = useQuery<GetLogsByIpResponse>(GET_LOGS_BY_IP, {
    variables: { ip },
    skip: !isOpen
  })

  // Filter data for this IP
  const ipAnomalies = anomaliesData?.anomalies?.anomalies?.filter(a => a.ip === ip) || []
  const ipLogs = logsData?.logsByIp || []

  // Calculate IP statistics
  const totalAnomalies = ipAnomalies.length
  const totalLogs = ipLogs.length
  const firstSeen = ipLogs.length > 0 ? ipLogs[ipLogs.length - 1]?.timestamp : null
  const lastSeen = ipLogs.length > 0 ? ipLogs[0]?.timestamp : null

  // Severity breakdown
  const severityBreakdown = ipAnomalies.reduce((acc, anomaly) => {
    const severity = anomaly.severity.toUpperCase()
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Timeline data for chart
  const timelineData = ipLogs.slice(0, 20).map((log, index) => ({
    time: formatTimestamp(log.timestamp),
    count: 1,
    type: log.eventType || 'unknown'
  }))

  const paginatedLogs = ipLogs.slice(logsPage * 10, (logsPage + 1) * 10)
  const paginatedAnomalies = ipAnomalies.slice(anomaliesPage * 10, (anomaliesPage + 1) * 10)

  const getDetectionIcon = (source: string) => {
    switch (source) {
      case 'RULE':
        return <ShieldCheckIcon className="h-4 w-4" />
      case 'AI':
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case 'HYBRID':
        return <ChartBarIcon className="h-4 w-4" />
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

  if (!isOpen) return null

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                IP Intelligence: {ip}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Detailed analysis and activity history
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'overview', label: 'Overview', icon: <ChartBarIcon className="h-4 w-4" /> },
              { id: 'logs', label: 'Logs', icon: <ClockIcon className="h-4 w-4" /> },
              { id: 'anomalies', label: 'Anomalies', icon: <ExclamationTriangleIcon className="h-4 w-4" /> },
              { id: 'timeline', label: 'Timeline', icon: <ChartBarIcon className="h-4 w-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Cards */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Total Logs</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalLogs}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Anomalies</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalAnomalies}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">First Seen</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {firstSeen ? formatTimestamp(firstSeen) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Last Seen</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {lastSeen ? formatTimestamp(lastSeen) : 'Unknown'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Severity Breakdown */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Anomaly Severity Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(severityBreakdown).map(([severity, count]) => (
                        <div key={severity} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge 
                              className={`${getSeverityColor(severity)} font-semibold px-3 py-1 rounded-full text-xs`}
                            >
                              {severity}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* External Actions */}
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>External Intelligence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() => setShowWhoisModal(true)}
                        className="w-full justify-start"
                      >
                        <GlobeAltIcon className="h-4 w-4 mr-2" />
                        WHOIS Lookup
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowThreatIntelModal(true)}
                        className="w-full justify-start"
                      >
                        <ShieldCheckIcon className="h-4 w-4 mr-2" />
                        Check Threat Intelligence
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'logs' && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Logs from {ip}</CardTitle>
                </CardHeader>
                <CardContent>
                  {logsLoading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading logs...
                    </div>
                  ) : paginatedLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No logs found for this IP
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paginatedLogs.map((log: LogEntry) => (
                        <div key={log.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 text-xs">
                                  {log.source}
                                </Badge>
                                {log.eventType && (
                                  <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300 text-xs">
                                    {log.eventType}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-900 dark:text-white mb-2">{log.event}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <UserIcon className="h-3 w-3" />
                                  <span>{log.user}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{formatTimestamp(log.timestamp)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Pagination */}
                      {ipLogs.length > 10 && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {logsPage * 10 + 1}-{Math.min((logsPage + 1) * 10, ipLogs.length)} of {ipLogs.length}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLogsPage(Math.max(0, logsPage - 1))}
                              disabled={logsPage === 0}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLogsPage(logsPage + 1)}
                              disabled={(logsPage + 1) * 10 >= ipLogs.length}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'anomalies' && (
              <Card>
                <CardHeader>
                  <CardTitle>Anomalies from {ip}</CardTitle>
                </CardHeader>
                <CardContent>
                  {anomaliesLoading ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Loading anomalies...
                    </div>
                  ) : paginatedAnomalies.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No anomalies found for this IP
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paginatedAnomalies.map((anomaly: Anomaly) => (
                        <div key={anomaly.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge 
                                  className={`${getSeverityColor(anomaly.severity)} font-semibold px-3 py-1 rounded-full text-xs`}
                                >
                                  {anomaly.severity}
                                </Badge>
                                <Badge 
                                  className={`${
                                    anomaly.status === 'OPEN' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                                    anomaly.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                                    anomaly.status === 'FALSE_POSITIVE' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' :
                                    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                  } font-semibold px-3 py-1 rounded-full text-xs`}
                                >
                                  {anomaly.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{anomaly.reason}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                <span className="flex items-center space-x-1">
                                  <div className={`p-1 rounded ${getDetectionColor(anomaly.detectionSource)}`}>
                                    {getDetectionIcon(anomaly.detectionSource)}
                                  </div>
                                  <span>{anomaly.detectionSource}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <ClockIcon className="h-3 w-3" />
                                  <span>{formatTimestamp(anomaly.timestamp)}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Pagination */}
                      {ipAnomalies.length > 10 && (
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Showing {anomaliesPage * 10 + 1}-{Math.min((anomaliesPage + 1) * 10, ipAnomalies.length)} of {ipAnomalies.length}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAnomaliesPage(Math.max(0, anomaliesPage - 1))}
                              disabled={anomaliesPage === 0}
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setAnomaliesPage(anomaliesPage + 1)}
                              disabled={(anomaliesPage + 1) * 10 >= ipAnomalies.length}
                            >
                              Next
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'timeline' && (
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#9ca3af' }}
                          axisLine={{ stroke: '#9ca3af' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickLine={{ stroke: '#9ca3af' }}
                          axisLine={{ stroke: '#9ca3af' }}
                        />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="count" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </Modal>

      {/* WHOIS Modal */}
      <Modal isOpen={showWhoisModal} onClose={() => setShowWhoisModal(false)} size="md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            WHOIS Lookup for {ip}
          </h3>
          <div className="text-center py-8">
            <GlobeAltIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Connect external WHOIS API to get detailed information about this IP address.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowWhoisModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Threat Intelligence Modal */}
      <Modal isOpen={showThreatIntelModal} onClose={() => setShowThreatIntelModal(false)} size="md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Threat Intelligence for {ip}
          </h3>
          <div className="text-center py-8">
            <ShieldCheckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Connect external threat intelligence API to check if this IP is known for malicious activity.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowThreatIntelModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
