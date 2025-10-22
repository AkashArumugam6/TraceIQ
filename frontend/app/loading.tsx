import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div>
        <LoadingSkeleton className="h-8 w-64 mb-2" />
        <LoadingSkeleton className="h-4 w-96" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <LoadingSkeleton className="h-4 w-24" />
              <LoadingSkeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-8 w-16 mb-2" />
              <LoadingSkeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <LoadingSkeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

