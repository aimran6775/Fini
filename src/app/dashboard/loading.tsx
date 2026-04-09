import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Skeleton className="lg:col-span-3 h-72 rounded-xl" />
        <Skeleton className="lg:col-span-2 h-72 rounded-xl" />
      </div>
      {/* Bottom grid skeleton */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="lg:col-span-2 h-80 rounded-xl" />
      </div>
    </div>
  );
}
