'use client'

import { ReactNode } from 'react'
import { Button } from './ui/Button'
import { 
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const defaultIcons = {
  anomalies: <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />,
  logs: <DocumentTextIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />,
  search: <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />,
  secure: <ShieldCheckIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />,
  add: <PlusIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />,
  refresh: <ArrowPathIcon className="h-12 w-12 text-gray-300 dark:text-gray-600" />
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className = ''
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className="flex items-center space-x-2"
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              className="flex items-center space-x-2"
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Predefined empty states for common scenarios
export function NoAnomaliesEmptyState({ onRefresh }: { onRefresh?: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.secure}
      title="No anomalies detected"
      description="Your system is currently secure. New anomalies will appear here as they are detected."
      action={onRefresh ? {
        label: 'Refresh',
        onClick: onRefresh,
        variant: 'outline'
      } : undefined}
    />
  )
}

export function NoLogsEmptyState({ onAddLog }: { onAddLog?: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.logs}
      title="No logs yet"
      description="Start by ingesting your first log entry to begin monitoring your system for anomalies."
      action={onAddLog ? {
        label: 'Add Log Entry',
        onClick: onAddLog
      } : undefined}
    />
  )
}

export function NoSearchResultsEmptyState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.search}
      title="No results found"
      description="Try adjusting your search criteria or filters to find what you're looking for."
      action={onClearFilters ? {
        label: 'Clear Filters',
        onClick: onClearFilters,
        variant: 'outline'
      } : undefined}
    />
  )
}

export function OfflineEmptyState({ onRetry }: { onRetry?: () => void }) {
  return (
    <EmptyState
      icon={defaultIcons.refresh}
      title="You're offline"
      description="Please check your internet connection and try again."
      action={onRetry ? {
        label: 'Retry',
        onClick: onRetry
      } : undefined}
    />
  )
}
