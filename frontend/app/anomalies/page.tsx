'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { AnomalyDetailsModal } from '@/components/AnomalyDetailsModal'
import { TableSkeleton } from '@/components/ui/LoadingSkeleton'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor } from '@/lib/utils/severity'
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  BoltIcon,
  EyeIcon,
  FunnelIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline'
import { Anomaly, SeverityLevel, DetectionSource, GetAnomaliesResponse } from '@/types'

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

export default function AnomaliesPage() {
  const [offset, setOffset] = useState(0)
  const limit = 15
  
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit, offset }
  })
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'ALL'>('ALL')
  const [detectionFilter, setDetectionFilter] = useState<DetectionSource | 'ALL'>('ALL')

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Anomalies
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              All detected security anomalies
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Anomalies
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              All detected security anomalies
            </p>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Anomalies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-red-600">
              Error loading anomalies: {error.message}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const allAnomalies: Anomaly[] = data?.anomalies?.anomalies || []
  const totalCount = data?.anomalies?.totalCount || 0
  const hasNextPage = data?.anomalies?.hasNextPage || false
  const hasPreviousPage = data?.anomalies?.hasPreviousPage || false

  // Filter anomalies
  const filteredAnomalies = allAnomalies.filter(anomaly => {
    const severityMatch = severityFilter === 'ALL' || anomaly.severity.toUpperCase() === severityFilter
    const detectionMatch = detectionFilter === 'ALL' || anomaly.detectionSource === detectionFilter
    return severityMatch && detectionMatch
  })

  const severityCounts = allAnomalies.reduce((acc, anomaly) => {
    const severity = anomaly.severity.toUpperCase() as SeverityLevel
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {} as Record<SeverityLevel, number>)

  const detectionCounts = allAnomalies.reduce((acc, anomaly) => {
    acc[anomaly.detectionSource] = (acc[anomaly.detectionSource] || 0) + 1
    return acc
  }, {} as Record<DetectionSource, number>)

  const handleNextPage = () => {
    setOffset(prev => prev + limit)
  }

  const handlePreviousPage = () => {
    setOffset(prev => Math.max(0, prev - limit))
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Anomalies
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            All detected security anomalies (Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount})
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Severity
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={severityFilter === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSeverityFilter('ALL')}
                >
                  All ({allAnomalies.length})
                </Button>
                {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityLevel[]).map((severity) => (
                  <Button
                    key={severity}
                    variant={severityFilter === severity ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSeverityFilter(severity)}
                  >
                    {severity} ({severityCounts[severity] || 0})
                  </Button>
                ))}
              </div>
            </div>

            {/* Detection Source Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detection Source
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={detectionFilter === 'ALL' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setDetectionFilter('ALL')}
                >
                  All
                </Button>
                {(['RULE', 'AI', 'HYBRID'] as DetectionSource[]).map((source) => (
                  <Button
                    key={source}
                    variant={detectionFilter === source ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDetectionFilter(source)}
                  >
                    {source} ({detectionCounts[source] || 0})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomalies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAnomalies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No anomalies found matching the current filters
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Detection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAnomalies.map((anomaly: Anomaly) => (
                    <tr 
                      key={anomaly.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={getSeverityColor(anomaly.severity)}
                        >
                          {anomaly.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {anomaly.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-mono">
                          {anomaly.ip}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-1">
                          <span className={getDetectionColor(anomaly.detectionSource)}>
                            {getDetectionIcon(anomaly.detectionSource)}
                          </span>
                          <span className="text-sm text-gray-900 dark:text-white">
                            {anomaly.detectionSource}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTimestamp(anomaly.timestamp)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedAnomaly(anomaly)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        
        {/* Pagination Controls */}
        {totalCount > limit && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Page {Math.floor(offset / limit) + 1} of {Math.ceil(totalCount / limit)}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                  className="flex items-center space-x-1"
                >
                  <span>Next</span>
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {selectedAnomaly && (
        <AnomalyDetailsModal
          anomaly={selectedAnomaly}
          isOpen={!!selectedAnomaly}
          onClose={() => setSelectedAnomaly(null)}
        />
      )}
    </div>
  )
}
