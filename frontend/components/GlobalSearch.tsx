'use client'

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse, Anomaly } from '@/types'
import { Modal } from './ui/Modal'
import { Badge } from './ui/Badge'
import { 
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { formatTimestamp } from '@/lib/utils/format'
import { getSeverityColor } from '@/lib/utils/severity'

interface SearchResult {
  type: 'anomaly' | 'log'
  data: Anomaly
  score: number
}

export function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { data, loading } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 1000, offset: 0 }
  })

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Search function
  const search = (searchQuery: string) => {
    if (!searchQuery.trim() || !data?.anomalies?.anomalies) {
      setResults([])
      return
    }

    setIsSearching(true)
    const anomalies = data.anomalies.anomalies
    const searchLower = searchQuery.toLowerCase()
    
    const searchResults: SearchResult[] = []

    // Search through anomalies
    anomalies.forEach(anomaly => {
      let score = 0
      
      // IP address match (exact)
      if (anomaly.ip.toLowerCase().includes(searchLower)) {
        score += 100
      }
      
      // User match
      if (anomaly.logEntry?.user?.toLowerCase().includes(searchLower)) {
        score += 80
      }
      
      // Reason match
      if (anomaly.reason.toLowerCase().includes(searchLower)) {
        score += 60
      }
      
      // Source match
      if (anomaly.logEntry?.source?.toLowerCase().includes(searchLower)) {
        score += 40
      }
      
      // Event match
      if (anomaly.logEntry?.event?.toLowerCase().includes(searchLower)) {
        score += 30
      }
      
      // Severity match
      if (anomaly.severity.toLowerCase().includes(searchLower)) {
        score += 20
      }

      if (score > 0) {
        searchResults.push({
          type: 'anomaly',
          data: anomaly,
          score
        })
      }
    })

    // Sort by score and limit results
    const sortedResults = searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)

    setResults(sortedResults)
    setIsSearching(false)
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      search(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const getResultIcon = (type: string, severity: string) => {
    if (type === 'anomaly') {
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
    return <ClockIcon className="h-5 w-5 text-gray-500" />
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Global Search
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search by IP, user, keywords..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading data...
            </div>
          ) : query.trim() === '' ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>Start typing to search anomalies and logs</p>
              <div className="mt-4 text-sm">
                <p>Try searching for:</p>
                <ul className="mt-2 space-y-1 text-gray-400 dark:text-gray-500">
                  <li>• IP addresses (e.g., 192.168.1.1)</li>
                  <li>• Usernames (e.g., admin)</li>
                  <li>• Keywords (e.g., failed login)</li>
                </ul>
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-2">Try different keywords or check your spelling</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.data.id}-${index}`}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {getResultIcon(result.type, result.data.severity)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {result.data.reason}
                      </p>
                      <Badge 
                        className={`${getSeverityColor(result.data.severity)} font-semibold px-2 py-1 rounded-full text-xs`}
                      >
                        {result.data.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-mono">{result.data.ip}</span>
                      {result.data.logEntry?.user && (
                        <span>User: {result.data.logEntry.user}</span>
                      )}
                      <span>{formatTimestamp(result.data.timestamp)}</span>
                    </div>
                    {result.data.logEntry?.event && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 truncate">
                        {result.data.logEntry.event}
                      </p>
                    )}
                  </div>
                  
                  {/* Score indicator */}
                  <div className="flex-shrink-0">
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {Math.round(result.score)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">Esc</kbd> to close</span>
              <span>Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">/</kbd> to search</span>
            </div>
            {results.length > 0 && (
              <span>{results.length} result{results.length !== 1 ? 's' : ''} found</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}
