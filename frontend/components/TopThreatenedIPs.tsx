'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { 
  ExclamationTriangleIcon,
  EyeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'
import { getSeverityColor } from '@/lib/utils/severity'
import { IPDetailsPanel } from './IPDetailsPanel'

interface IPThreatData {
  ip: string
  anomalyCount: number
  criticalCount: number
  highCount: number
  mediumCount: number
  lowCount: number
  lastSeen: string
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
}

export function TopThreatenedIPs({ onIpClick }: { onIpClick?: (ip: string) => void }) {
  const [selectedIP, setSelectedIP] = useState<string | null>(null)
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 1000, offset: 0 }
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Threatened IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
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
          <CardTitle>Top Threatened IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Unable to load IP threat data
          </div>
        </CardContent>
      </Card>
    )
  }

  const anomalies = data?.anomalies?.anomalies || []
  
  // Group anomalies by IP and calculate threat levels
  const ipThreats = anomalies.reduce((acc, anomaly) => {
    const ip = anomaly.ip
    if (!acc[ip]) {
      acc[ip] = {
        ip,
        anomalyCount: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        lastSeen: anomaly.timestamp,
        severity: 'LOW' as const
      }
    }
    
    acc[ip].anomalyCount++
    acc[ip].lastSeen = new Date(anomaly.timestamp) > new Date(acc[ip].lastSeen) 
      ? anomaly.timestamp 
      : acc[ip].lastSeen
    
    const severity = anomaly.severity.toUpperCase() as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
    acc[ip][`${severity.toLowerCase()}Count`]++
    
    // Update overall severity (highest takes precedence)
    if (severity === 'CRITICAL' || (severity === 'HIGH' && acc[ip].severity !== 'CRITICAL')) {
      acc[ip].severity = severity
    } else if (severity === 'MEDIUM' && !['CRITICAL', 'HIGH'].includes(acc[ip].severity)) {
      acc[ip].severity = severity
    }
    
    return acc
  }, {} as Record<string, IPThreatData>)

  // Sort by anomaly count and take top 10
  const topThreatenedIPs = Object.values(ipThreats)
    .sort((a, b) => b.anomalyCount - a.anomalyCount)
    .slice(0, 10)

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  if (topThreatenedIPs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Threatened IPs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No threats detected
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              All IPs are currently secure
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Threatened IPs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topThreatenedIPs.map((ipData, index) => (
            <div
              key={ipData.ip}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group"
              onClick={() => onIpClick?.(ipData.ip)}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                {index + 1}
              </div>
              
              {/* IP and details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                    {ipData.ip}
                  </code>
                  <Badge 
                    className={`${getSeverityColor(ipData.severity)} font-semibold px-2 py-1 rounded-full text-xs`}
                  >
                    {ipData.severity}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>{ipData.anomalyCount} anomalies</span>
                  <span>Last seen: {formatLastSeen(ipData.lastSeen)}</span>
                </div>
              </div>
              
              {/* Action button */}
              <Button
                variant="outline"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIP(ipData.ip)
                  onIpClick?.(ipData.ip)
                }}
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          ))}
        </div>
        
        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing top {topThreatenedIPs.length} of {Object.keys(ipThreats).length} unique IPs
          </div>
        </div>
      </CardContent>
      
      {/* IP Details Panel */}
      {selectedIP && (
        <IPDetailsPanel
          ip={selectedIP}
          isOpen={!!selectedIP}
          onClose={() => setSelectedIP(null)}
        />
      )}
    </Card>
  )
}
