'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  CogIcon,
  BellIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowDownTrayIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // AI Analysis settings
    aiAnalysisInterval: '5', // minutes
    aiBatchSize: '100',
    
    // Notification preferences
    criticalNotifications: true,
    highNotifications: true,
    mediumNotifications: false,
    lowNotifications: false,
    browserNotifications: true,
    toastNotifications: true,
    
    // Theme preference
    theme: 'system', // light, dark, system
    
    // Detection rules
    enableRuleBasedDetection: true,
    enableAiDetection: true,
    enableHybridDetection: true,
    
    // Specific rules
    enableFailedLoginDetection: true,
    enableSuspiciousActivityDetection: true,
    enableUnusualTrafficDetection: true,
    enableDataExfiltrationDetection: true
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // In a real app, this would save to backend
      localStorage.setItem('traceiq-settings', JSON.stringify(settings))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const data = {
        settings,
        exportDate: new Date().toISOString(),
        version: '1.0.0'
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `traceiq-settings-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      window.URL.revokeObjectURL(url)
      
      toast.success('Settings exported successfully')
    } catch (error) {
      toast.error('Failed to export settings')
    } finally {
      setIsExporting(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default values?')) {
      setSettings({
        aiAnalysisInterval: '5',
        aiBatchSize: '100',
        criticalNotifications: true,
        highNotifications: true,
        mediumNotifications: false,
        lowNotifications: false,
        browserNotifications: true,
        toastNotifications: true,
        theme: 'system',
        enableRuleBasedDetection: true,
        enableAiDetection: true,
        enableHybridDetection: true,
        enableFailedLoginDetection: true,
        enableSuspiciousActivityDetection: true,
        enableUnusualTrafficDetection: true,
        enableDataExfiltrationDetection: true
      })
      toast.success('Settings reset to defaults')
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Configure TraceIQ behavior and preferences
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            <span>Export Settings</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* AI Analysis Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SparklesIcon className="h-5 w-5 text-purple-600" />
              <span>AI Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Analysis Interval
              </label>
              <select
                value={settings.aiAnalysisInterval}
                onChange={(e) => handleSettingChange('aiAnalysisInterval', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="2">Every 2 minutes</option>
                <option value="5">Every 5 minutes</option>
                <option value="10">Every 10 minutes</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every hour</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Batch Size
              </label>
              <select
                value={settings.aiBatchSize}
                onChange={(e) => handleSettingChange('aiBatchSize', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="50">50 logs per batch</option>
                <option value="100">100 logs per batch</option>
                <option value="200">200 logs per batch</option>
                <option value="500">500 logs per batch</option>
              </select>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Detection Methods
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableAiDetection}
                    onChange={(e) => handleSettingChange('enableAiDetection', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">AI Detection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableHybridDetection}
                    onChange={(e) => handleSettingChange('enableHybridDetection', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Hybrid Detection</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BellIcon className="h-5 w-5 text-blue-600" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Severity Levels
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'criticalNotifications', label: 'Critical', color: 'text-red-600' },
                  { key: 'highNotifications', label: 'High', color: 'text-orange-600' },
                  { key: 'mediumNotifications', label: 'Medium', color: 'text-yellow-600' },
                  { key: 'lowNotifications', label: 'Low', color: 'text-green-600' }
                ].map(({ key, label, color }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof typeof settings] as boolean}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${color}`}>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Notification Types
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.browserNotifications}
                    onChange={(e) => handleSettingChange('browserNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Browser Notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.toastNotifications}
                    onChange={(e) => handleSettingChange('toastNotifications', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Toast Notifications</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <SunIcon className="h-5 w-5 text-yellow-600" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: 'Light', icon: SunIcon },
                  { value: 'dark', label: 'Dark', icon: MoonIcon },
                  { value: 'system', label: 'System', icon: ComputerDesktopIcon }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleSettingChange('theme', value)}
                    className={`flex flex-col items-center space-y-2 p-3 rounded-lg border transition-colors ${
                      settings.theme === value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detection Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              <span>Detection Rules</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Rule-Based Detection
              </h4>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableRuleBasedDetection}
                    onChange={(e) => handleSettingChange('enableRuleBasedDetection', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Enable Rule-Based Detection</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Specific Rules
              </h4>
              <div className="space-y-2">
                {[
                  { key: 'enableFailedLoginDetection', label: 'Failed Login Detection' },
                  { key: 'enableSuspiciousActivityDetection', label: 'Suspicious Activity Detection' },
                  { key: 'enableUnusualTrafficDetection', label: 'Unusual Traffic Detection' },
                  { key: 'enableDataExfiltrationDetection', label: 'Data Exfiltration Detection' }
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings[key as keyof typeof settings] as boolean}
                      onChange={(e) => handleSettingChange(key, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600 dark:text-red-400">
            <XMarkIcon className="h-5 w-5" />
            <span>Danger Zone</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reset Settings
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Reset all settings to their default values. This action cannot be undone.
              </p>
              <Button
                variant="outline"
                onClick={handleReset}
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
