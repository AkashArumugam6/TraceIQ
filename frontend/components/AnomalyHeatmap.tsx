'use client'

import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns'
import { Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface HeatmapData {
  day: string
  date: string
  count: number
  level: number
}

export function AnomalyHeatmap() {
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 1000, offset: 0 }
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Heatmap (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 bg-gray-100 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Anomaly Heatmap (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Unable to load heatmap data
          </div>
        </CardContent>
      </Card>
    )
  }

  const anomalies = data?.anomalies?.anomalies || []
  const thirtyDaysAgo = subDays(new Date(), 30)
  const today = new Date()
  
  // Create array of last 30 days
  const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today })
  
  // Count anomalies per day
  const anomalyCounts = days.map(day => {
    const dayStart = new Date(day)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(day)
    dayEnd.setHours(23, 59, 59, 999)
    
    const count = anomalies.filter(anomaly => {
      const anomalyDate = new Date(anomaly.timestamp)
      return anomalyDate >= dayStart && anomalyDate <= dayEnd
    }).length

    // Calculate intensity level (0-4)
    const maxCount = Math.max(...days.map(d => {
      const dStart = new Date(d)
      dStart.setHours(0, 0, 0, 0)
      const dEnd = new Date(d)
      dEnd.setHours(23, 59, 59, 999)
      
      return anomalies.filter(anomaly => {
        const anomalyDate = new Date(anomaly.timestamp)
        return anomalyDate >= dStart && anomalyDate <= dEnd
      }).length
    }))

    const level = maxCount > 0 ? Math.ceil((count / maxCount) * 4) : 0

    return {
      day: format(day, 'EEE'),
      date: format(day, 'MMM dd'),
      count,
      level
    }
  })

  // Group by weeks
  const weeks: HeatmapData[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(anomalyCounts.slice(i, i + 7))
  }

  const getColor = (level: number) => {
    switch (level) {
      case 0: return '#f3f4f6' // gray-100
      case 1: return '#dbeafe' // blue-100
      case 2: return '#93c5fd' // blue-300
      case 3: return '#3b82f6' // blue-500
      case 4: return '#1d4ed8' // blue-700
      default: return '#f3f4f6'
    }
  }

  const getDarkColor = (level: number) => {
    switch (level) {
      case 0: return '#374151' // gray-700
      case 1: return '#1e3a8a' // blue-800
      case 2: return '#1e40af' // blue-700
      case 3: return '#1d4ed8' // blue-600
      case 4: return '#1e40af' // blue-700
      default: return '#374151'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Anomaly Heatmap (Last 30 Days)</span>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Less</span>
            <div className="flex space-x-1">
              {[0, 1, 2, 3, 4].map(level => (
                <div
                  key={level}
                  className="w-3 h-3 rounded-sm"
                  style={{ 
                    backgroundColor: getColor(level),
                    '@media (prefers-color-scheme: dark)': {
                      backgroundColor: getDarkColor(level)
                    }
                  }}
                />
              ))}
            </div>
            <span>More</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Week labels */}
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
            <span>Sun</span>
          </div>
          
          {/* Heatmap grid */}
          <div className="grid grid-cols-7 gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                    style={{ 
                      backgroundColor: getColor(day.level),
                      '@media (prefers-color-scheme: dark)': {
                        backgroundColor: getDarkColor(day.level)
                      }
                    }}
                    title={`${day.date}: ${day.count} anomalies`}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Summary stats */}
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <span>Total anomalies: {anomalies.length}</span>
            <span>Avg per day: {Math.round(anomalies.length / 30)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
