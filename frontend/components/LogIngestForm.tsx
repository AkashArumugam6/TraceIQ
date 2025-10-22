'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { INGEST_LOG } from '@/lib/graphql/mutations'
import { IngestLogResponse, LogIngestInput } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { toast } from 'react-hot-toast'
import { DocumentPlusIcon } from '@heroicons/react/24/outline'

export function LogIngestForm() {
  const [formData, setFormData] = useState<LogIngestInput>({
    source: '',
    event: '',
    eventType: '',
    ip: '',
    user: '',
  })

  const [ingestLog, { loading }] = useMutation<IngestLogResponse>(INGEST_LOG, {
    onCompleted: (data) => {
      if (data.ingestLog.success) {
        toast.success('Log ingested successfully!')
        setFormData({
          source: '',
          event: '',
          eventType: '',
          ip: '',
          user: '',
        })
      } else {
        toast.error(data.ingestLog.message)
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.source || !formData.event || !formData.ip || !formData.user) {
      toast.error('Please fill in all required fields')
      return
    }

    await ingestLog({
      variables: {
        source: formData.source,
        event: formData.event,
        eventType: formData.eventType || null,
        ip: formData.ip,
        user: formData.user,
      },
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const presetLogs = [
    {
      name: 'Failed Login',
      data: {
        source: 'auth-server',
        event: 'login_failed',
        eventType: 'FAILED_LOGIN',
        ip: '192.168.1.100',
        user: 'attacker',
      },
    },
    {
      name: 'Sudo Command',
      data: {
        source: 'system',
        event: 'user_command',
        eventType: 'sudo_command',
        ip: '10.0.0.50',
        user: 'suspicious_user',
      },
    },
    {
      name: 'Data Access',
      data: {
        source: 'database',
        event: 'data_access',
        eventType: 'DATA_ACCESS',
        ip: '172.16.0.25',
        user: 'admin',
      },
    },
  ]

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-gray-800">
      <CardHeader className="border-b border-gray-200 dark:border-gray-700">
        <CardTitle className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <DocumentPlusIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-xl font-semibold text-gray-900 dark:text-white">Ingest Test Log</span>
            <div className="text-sm text-gray-500 dark:text-gray-400">Add new security events</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="source" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Source *
              </label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="e.g., web-server, auth-server"
                required
                suppressHydrationWarning={true}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="event" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Event *
              </label>
              <input
                type="text"
                id="event"
                name="event"
                value={formData.event}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="e.g., login_attempt, data_access"
                required
                suppressHydrationWarning={true}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="eventType" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Event Type
              </label>
              <select
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                suppressHydrationWarning={true}
              >
                <option value="">Select event type</option>
                <option value="FAILED_LOGIN">Failed Login</option>
                <option value="SUCCESSFUL_LOGIN">Successful Login</option>
                <option value="sudo_command">Sudo Command</option>
                <option value="DATA_ACCESS">Data Access</option>
                <option value="FILE_ACCESS">File Access</option>
                <option value="NETWORK_ACCESS">Network Access</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="ip" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                IP Address *
              </label>
              <input
                type="text"
                id="ip"
                name="ip"
                value={formData.ip}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono transition-all duration-200"
                placeholder="e.g., 192.168.1.100"
                required
                suppressHydrationWarning={true}
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="user" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                User *
              </label>
              <input
                type="text"
                id="user"
                name="user"
                value={formData.user}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all duration-200"
                placeholder="e.g., admin, user123"
                required
                suppressHydrationWarning={true}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
              suppressHydrationWarning={true}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ingesting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <DocumentPlusIcon className="h-4 w-4" />
                  <span>Ingest Log</span>
                </div>
              )}
            </Button>
          </div>
        </form>

        {/* Preset Logs */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center space-x-2">
            <div className="w-1 h-4 bg-blue-500 rounded"></div>
            <span>Quick Test Logs</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {presetLogs.map((preset, index) => (
              <button
                key={index}
                onClick={() => setFormData(preset.data)}
                className="text-left p-4 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 bg-white dark:bg-gray-800"
                suppressHydrationWarning={true}
              >
                <div className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                  {preset.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {preset.data.source} • {preset.data.event}
                </div>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
