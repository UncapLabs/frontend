import { Card, CardContent } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export function TroveLoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Panel - Position Details Skeleton */}
      <div className="md:col-span-2 space-y-6">
        <Card className="border border-slate-200 shadow-sm">
          <div className="p-6">
            <Skeleton className="h-6 w-32 mb-6" />
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-7 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-7 w-28" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-px w-full" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Action Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-slate-200 shadow-sm">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
                <Skeleton className="h-10 w-10 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Right Panel Skeleton */}
      <div className="md:col-span-1">
        <Card className="border border-slate-200 shadow-sm sticky top-8">
          <div className="p-6">
            <Skeleton className="h-6 w-36 mb-6" />
            <div className="space-y-4">
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-px w-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 mb-2" />
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}