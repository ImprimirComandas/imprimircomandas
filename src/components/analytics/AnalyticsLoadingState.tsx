
import { Card, CardContent, CardHeader } from '../ui/card';

export function AnalyticsLoadingState() {
  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      <div className="mb-6">
        <div className="h-8 bg-muted rounded-md w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-muted rounded-md w-96 mb-4 animate-pulse" />
        <div className="h-16 bg-muted rounded-md animate-pulse" />
      </div>

      {/* KPIs Loading */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-24">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-6 bg-muted rounded w-16 mb-1 animate-pulse" />
              <div className="h-3 bg-muted rounded w-24 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-80">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
              <div className="h-4 bg-muted rounded w-48 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-60 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tables Loading */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-96">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-40 animate-pulse" />
              <div className="h-4 bg-muted rounded w-56 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="h-12 bg-muted rounded animate-pulse" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
