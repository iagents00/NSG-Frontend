import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton for CalendarHeatmap component
 */
export function SkeletonCalendarHeatmap() {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="w-48 h-6" />
            <Skeleton variant="text" className="w-32 h-3" />
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="space-y-2">
          {/* Month labels */}
          <div className="grid grid-cols-12 gap-1 mb-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} variant="text" className="h-3" />
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton 
                key={i}
                variant="default"
                className="aspect-square w-full rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <Skeleton variant="text" className="w-16 h-3" />
          <div className="flex items-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton 
                key={i}
                variant="circle"
                className="w-4 h-4"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
