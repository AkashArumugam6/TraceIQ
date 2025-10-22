'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
            Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
          <div className="space-y-3">
            <Button onClick={reset} className="w-full">
              Try again
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
          {error.digest && (
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Error ID: {error.digest}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

