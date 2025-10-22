'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { TableSkeleton } from './ui/LoadingSkeleton'
import { AnomalyDetailsModal } from './AnomalyDetailsModal'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor } from '@/lib/utils/severity'
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  BoltIcon,
  EyeIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ChevronLeftIcon
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

export function AnomaliesTable() {
  const [offset, setOffset] = useState(0)
  const limit = 15
  
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit, offset }
  })
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Anomalies
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unable to load anomalies
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {error.message.includes('Failed to fetch') 
                ? 'Please check if the backend server is running on port 4000'
                : error.message
              }
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const anomalies = data?.anomalies?.anomalies || []
  const totalCount = data?.anomalies?.totalCount || 0
  const hasNextPage = data?.anomalies?.hasNextPage || false
  const hasPreviousPage = data?.anomalies?.hasPreviousPage || false

  const handleNextPage = () => {
    setOffset(prev => prev + limit)
  }

  const handlePreviousPage = () => {
    setOffset(prev => Math.max(0, prev - limit))
  }

  return (
    <>
      <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Anomalies
            </CardTitle>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount}
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {anomalies.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No anomalies detected
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Your system is currently secure
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      IP Address
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Detection
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {anomalies.map((anomaly: Anomaly) => (
                    <tr 
                      key={anomaly.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={`${getSeverityColor(anomaly.severity)} font-semibold px-3 py-1 rounded-full text-xs`}
                        >
                          {anomaly.severity}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {anomaly.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                          {anomaly.ip}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 ${getDetectionColor(anomaly.detectionSource)}`}>
                            {getDetectionIcon(anomaly.detectionSource)}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
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
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
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
    </>
  )
}
