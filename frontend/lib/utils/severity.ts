import { SeverityLevel } from '@/types'

export function getSeverityColor(severity: SeverityLevel | string): string {
  const normalizedSeverity = severity.toUpperCase() as SeverityLevel
  
  switch (normalizedSeverity) {
    case 'CRITICAL':
      return 'bg-critical-100 text-critical-800 border-critical-200'
    case 'HIGH':
      return 'bg-high-100 text-high-800 border-high-200'
    case 'MEDIUM':
      return 'bg-medium-100 text-medium-800 border-medium-200'
    case 'LOW':
      return 'bg-low-100 text-low-800 border-low-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export function getSeverityIconColor(severity: SeverityLevel | string): string {
  const normalizedSeverity = severity.toUpperCase() as SeverityLevel
  
  switch (normalizedSeverity) {
    case 'CRITICAL':
      return 'text-critical-500'
    case 'HIGH':
      return 'text-high-500'
    case 'MEDIUM':
      return 'text-medium-500'
    case 'LOW':
      return 'text-low-500'
    default:
      return 'text-gray-500'
  }
}

export function getSeverityBgColor(severity: SeverityLevel | string): string {
  const normalizedSeverity = severity.toUpperCase() as SeverityLevel
  
  switch (normalizedSeverity) {
    case 'CRITICAL':
      return 'bg-critical-50'
    case 'HIGH':
      return 'bg-high-50'
    case 'MEDIUM':
      return 'bg-medium-50'
    case 'LOW':
      return 'bg-low-50'
    default:
      return 'bg-gray-50'
  }
}

