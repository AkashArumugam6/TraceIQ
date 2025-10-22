'use client'

import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { LoadingSkeleton } from './ui/LoadingSkeleton'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format, subDays, startOfDay } from 'date-fns'
import { ChartBarIcon } from '@heroicons/react/24/outline'
import { Anomaly } from '@/types'

export function ThreatTimeline() {
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <span>Threat Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <ChartBarIcon className="h-5 w-5 text-blue-600" />
            <span>Threat Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-600">
            Error loading timeline: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  const anomalies: Anomaly[] = data?.anomalies?.anomalies || []

  // Process data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    return {
      date: format(date, 'MMM dd'),
      fullDate: startOfDay(date),
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    }
  })

  // Count anomalies by day and severity
  anomalies.forEach((anomaly) => {
    const anomalyDate = new Date(anomaly.timestamp)
    const dayIndex = last7Days.findIndex(day => 
      day.fullDate.getTime() === startOfDay(anomalyDate).getTime()
    )
    
    if (dayIndex !== -1) {
      const severity = anomaly.severity.toUpperCase()
      if (severity === 'CRITICAL') {
        last7Days[dayIndex].critical++
      } else if (severity === 'HIGH') {
        last7Days[dayIndex].high++
      } else if (severity === 'MEDIUM') {
        last7Days[dayIndex].medium++
      } else if (severity === 'LOW') {
        last7Days[dayIndex].low++
      }
    }
  })

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-blue-600" />
          <span>Threat Timeline (Last 7 Days)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={{ stroke: '#6b7280' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="critical"
                stackId="1"
                stroke="#dc2626"
                fill="#dc2626"
                fillOpacity={0.6}
                name="Critical"
              />
              <Area
                type="monotone"
                dataKey="high"
                stackId="1"
                stroke="#ea580c"
                fill="#ea580c"
                fillOpacity={0.6}
                name="High"
              />
              <Area
                type="monotone"
                dataKey="medium"
                stackId="1"
                stroke="#d97706"
                fill="#d97706"
                fillOpacity={0.6}
                name="Medium"
              />
              <Area
                type="monotone"
                dataKey="low"
                stackId="1"
                stroke="#2563eb"
                fill="#2563eb"
                fillOpacity={0.6}
                name="Low"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Critical</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-600 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-600 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
