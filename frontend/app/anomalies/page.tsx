'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@apollo/client/react'
import { useSearchParams, useRouter } from 'next/navigation'
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
  ChevronLeftIcon,
  XMarkIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon
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

type StatusFilter = 'ALL' | 'OPEN' | 'INVESTIGATING' | 'FALSE_POSITIVE' | 'RESOLVED'
type DateRange = '24h' | '7d' | '30d' | 'custom'

export default function AnomaliesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [offset, setOffset] = useState(0)
  const limit = 15
  
  // Filters from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [severityFilter, setSeverityFilter] = useState<SeverityLevel | 'ALL'>(
    (searchParams.get('severity') as SeverityLevel) || 'ALL'
  )
  const [detectionFilter, setDetectionFilter] = useState<DetectionSource | 'ALL'>(
    (searchParams.get('detection') as DetectionSource) || 'ALL'
  )
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    (searchParams.get('status') as StatusFilter) || 'ALL'
  )
  const [dateRange, setDateRange] = useState<DateRange>(
    (searchParams.get('dateRange') as DateRange) || '7d'
  )
  const [customDateRange, setCustomDateRange] = useState({
    start: searchParams.get('startDate') || '',
    end: searchParams.get('endDate') || ''
  })
  
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 1000, offset: 0 } // Get all for filtering
  })
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (severityFilter !== 'ALL') params.set('severity', severityFilter)
    if (detectionFilter !== 'ALL') params.set('detection', detectionFilter)
    if (statusFilter !== 'ALL') params.set('status', statusFilter)
    if (dateRange !== '7d') params.set('dateRange', dateRange)
    if (dateRange === 'custom' && customDateRange.start) params.set('startDate', customDateRange.start)
    if (dateRange === 'custom' && customDateRange.end) params.set('endDate', customDateRange.end)
    
    const newUrl = params.toString() ? `?${params.toString()}` : ''
    router.replace(`/anomalies${newUrl}`, { scroll: false })
  }, [searchQuery, severityFilter, detectionFilter, statusFilter, dateRange, customDateRange, router])

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
  
  // Date range filtering
  const getDateRangeFilter = () => {
    const now = new Date()
    switch (dateRange) {
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      case 'custom':
        return customDateRange.start ? new Date(customDateRange.start) : null
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }
  }

  const endDate = dateRange === 'custom' && customDateRange.end 
    ? new Date(customDateRange.end) 
    : new Date()

  // Filter anomalies
  const filteredAnomalies = allAnomalies.filter(anomaly => {
    const anomalyDate = new Date(anomaly.timestamp)
    const startDate = getDateRangeFilter()
    
    // Date range filter
    const dateMatch = !startDate || (anomalyDate >= startDate && anomalyDate <= endDate)
    
    // Severity filter
    const severityMatch = severityFilter === 'ALL' || anomaly.severity.toUpperCase() === severityFilter
    
    // Detection source filter
    const detectionMatch = detectionFilter === 'ALL' || anomaly.detectionSource === detectionFilter
    
    // Status filter
    const statusMatch = statusFilter === 'ALL' || anomaly.status === statusFilter
    
    // Search filter
    const searchMatch = !searchQuery || 
      anomaly.ip.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anomaly.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anomaly.logEntry?.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anomaly.logEntry?.event?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return dateMatch && severityMatch && detectionMatch && statusMatch && searchMatch
  })

  const totalCount = filteredAnomalies.length
  const paginatedAnomalies = filteredAnomalies.slice(offset, offset + limit)
  const hasNextPage = offset + limit < totalCount
  const hasPreviousPage = offset > 0

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

  const clearAllFilters = () => {
    setSearchQuery('')
    setSeverityFilter('ALL')
    setDetectionFilter('ALL')
    setStatusFilter('ALL')
    setDateRange('7d')
    setCustomDateRange({ start: '', end: '' })
    setOffset(0)
  }

  const exportToCSV = () => {
    const csvContent = [
      ['ID', 'Severity', 'Reason', 'IP Address', 'Detection Source', 'Status', 'Timestamp', 'User', 'Event'].join(','),
      ...paginatedAnomalies.map(anomaly => [
        anomaly.id,
        anomaly.severity,
        `"${anomaly.reason}"`,
        anomaly.ip,
        anomaly.detectionSource,
        anomaly.status,
        anomaly.timestamp,
        anomaly.logEntry?.user || '',
        `"${anomaly.logEntry?.event || ''}"`
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `anomalies-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Anomalies
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Showing {offset + 1}-{Math.min(offset + limit, totalCount)} of {totalCount} anomalies
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={exportToCSV}
            className="flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <FunnelIcon className="h-4 w-4" />
            <span>Filters</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by IP, user, keywords..."
          className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5" />
                <span>Advanced Filters</span>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center space-x-1"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Clear All</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="24h">Last 24 hours</option>
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="custom">Custom range</option>
                  </select>
                  {dateRange === 'custom' && (
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={customDateRange.start}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="date"
                        value={customDateRange.end}
                        onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Severity
                </label>
                <div className="space-y-2">
                  {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityLevel[]).map((severity) => (
                    <label key={severity} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={severityFilter === severity}
                        onChange={() => setSeverityFilter(severityFilter === severity ? 'ALL' : severity)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {severity} ({severityCounts[severity] || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Detection Source Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detection Source
                </label>
                <div className="space-y-2">
                  {(['RULE', 'AI', 'HYBRID'] as DetectionSource[]).map((source) => (
                    <label key={source} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={detectionFilter === source}
                        onChange={() => setDetectionFilter(detectionFilter === source ? 'ALL' : source)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {source} ({detectionCounts[source] || 0})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="space-y-2">
                  {(['OPEN', 'INVESTIGATING', 'FALSE_POSITIVE', 'RESOLVED'] as StatusFilter[]).map((status) => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={statusFilter === status}
                        onChange={() => setStatusFilter(statusFilter === status ? 'ALL' : status)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {status.replace('_', ' ')} ({allAnomalies.filter(a => a.status === status).length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anomalies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Anomalies</CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedAnomalies.length === 0 ? (
            <div className="text-center py-12">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No anomalies found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {filteredAnomalies.length === 0 
                  ? 'No anomalies match your current filters'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
              {filteredAnomalies.length === 0 && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="flex items-center space-x-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  <span>Clear All Filters</span>
                </Button>
              )}
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
                      Status
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
                  {paginatedAnomalies.map((anomaly: Anomaly) => (
                    <tr 
                      key={anomaly.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          className={`${getSeverityColor(anomaly.severity)} font-semibold px-3 py-1 rounded-full text-xs`}
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
                        <Badge 
                          className={`${
                            anomaly.status === 'OPEN' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' :
                            anomaly.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' :
                            anomaly.status === 'FALSE_POSITIVE' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300' :
                            'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                          } font-semibold px-3 py-1 rounded-full text-xs`}
                        >
                          {anomaly.status?.replace('_', ' ') || 'Unknown'}
                        </Badge>
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
    </div>
  )
}
