'use client'

import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { 
  ShieldCheckIcon, 
  SparklesIcon, 
  BoltIcon 
} from '@heroicons/react/24/outline'

interface DetectionData {
  source: string
  count: number
  percentage: number
  color: string
  icon: React.ReactNode
}

export function DetectionSourceComparison() {
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 1000, offset: 0 }
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detection Source Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detection Source Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Unable to load detection data
          </div>
        </CardContent>
      </Card>
    )
  }

  const anomalies = data?.anomalies?.anomalies || []
  
  // Count anomalies by detection source
  const sourceCounts = anomalies.reduce((acc, anomaly) => {
    const source = anomaly.detectionSource || 'RULE'
    acc[source] = (acc[source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = anomalies.length
  const detectionData: DetectionData[] = [
    {
      source: 'RULE',
      count: sourceCounts.RULE || 0,
      percentage: total > 0 ? Math.round(((sourceCounts.RULE || 0) / total) * 100) : 0,
      color: '#3b82f6', // blue-500
      icon: <ShieldCheckIcon className="h-4 w-4" />
    },
    {
      source: 'AI',
      count: sourceCounts.AI || 0,
      percentage: total > 0 ? Math.round(((sourceCounts.AI || 0) / total) * 100) : 0,
      color: '#8b5cf6', // violet-500
      icon: <SparklesIcon className="h-4 w-4" />
    },
    {
      source: 'HYBRID',
      count: sourceCounts.HYBRID || 0,
      percentage: total > 0 ? Math.round(((sourceCounts.HYBRID || 0) / total) * 100) : 0,
      color: '#f59e0b', // amber-500
      icon: <BoltIcon className="h-4 w-4" />
    }
  ].filter(item => item.count > 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 mb-2">
            <div className="text-gray-600 dark:text-gray-400">{data.icon}</div>
            <p className="font-medium text-gray-900 dark:text-white">{data.source}</p>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.count} detections ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  if (detectionData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detection Source Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No detections yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Detection sources will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detection Source Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={detectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="source" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#9ca3af' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#9ca3af' }}
                axisLine={{ stroke: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {detectionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-center gap-6">
            {detectionData.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {item.source} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
