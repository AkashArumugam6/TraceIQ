import { cn } from '@/lib/utils/cn'

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  )
}

export function TableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <LoadingSkeleton className="h-4 w-16" />
          <LoadingSkeleton className="h-4 w-32" />
          <LoadingSkeleton className="h-4 w-24" />
          <LoadingSkeleton className="h-4 w-20" />
          <LoadingSkeleton className="h-4 w-28" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="space-y-4">
      <LoadingSkeleton className="h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-full" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  )
}

