'use client'

import { useQuery } from '@apollo/client/react'
import { GET_ANOMALIES } from '@/lib/graphql/queries'
import { GetAnomaliesResponse } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { getSeverityColor } from '@/lib/utils/severity'

interface SeverityData {
  name: string
  value: number
  percentage: number
  color: string
}

export function SeverityDistribution() {
  const { data, loading, error } = useQuery<GetAnomaliesResponse>(GET_ANOMALIES, {
    variables: { limit: 1000, offset: 0 }
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
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
          <CardTitle>Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Unable to load severity data
          </div>
        </CardContent>
      </Card>
    )
  }

  const anomalies = data?.anomalies?.anomalies || []
  
  // Count anomalies by severity
  const severityCounts = anomalies.reduce((acc, anomaly) => {
    const severity = anomaly.severity.toUpperCase()
    acc[severity] = (acc[severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = anomalies.length
  const severityData: SeverityData[] = [
    {
      name: 'Critical',
      value: severityCounts.CRITICAL || 0,
      percentage: total > 0 ? Math.round(((severityCounts.CRITICAL || 0) / total) * 100) : 0,
      color: '#dc2626' // red-600
    },
    {
      name: 'High',
      value: severityCounts.HIGH || 0,
      percentage: total > 0 ? Math.round(((severityCounts.HIGH || 0) / total) * 100) : 0,
      color: '#ea580c' // orange-600
    },
    {
      name: 'Medium',
      value: severityCounts.MEDIUM || 0,
      percentage: total > 0 ? Math.round(((severityCounts.MEDIUM || 0) / total) * 100) : 0,
      color: '#d97706' // amber-600
    },
    {
      name: 'Low',
      value: severityCounts.LOW || 0,
      percentage: total > 0 ? Math.round(((severityCounts.LOW || 0) / total) * 100) : 0,
      color: '#16a34a' // green-600
    }
  ].filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-medium text-gray-900 dark:text-white">{data.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.value} anomalies ({data.percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.value} {entry.value === 1 ? 'anomaly' : 'anomalies'}
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (severityData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No anomalies detected
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              System is currently secure
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Severity Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Total:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{total}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Critical:</span>
              <span className="ml-2 font-medium text-red-600">{severityCounts.CRITICAL || 0}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
