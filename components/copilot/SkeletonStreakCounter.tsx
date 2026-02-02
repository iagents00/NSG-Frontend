import { Skeleton } from "@/components/ui/Skeleton";

/**
 * Skeleton for StreakCounter component
 */
export function SkeletonStreakCounter() {
  return (
    <div className="bg-linear-to-br from-orange-50 to-red-50 p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-orange-200/50 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-orange-100 rounded-full blur-2xl opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          {/* Current Streak */}
          <div className="flex items-center gap-4">
            <Skeleton variant="circle" className="w-16 h-16 sm:w-20 sm:h-20" />
            <div className="text-left space-y-2">
              <Skeleton variant="text" className="w-24 h-3" />
              <Skeleton className="w-16 h-10 rounded-xl" />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-16 bg-orange-300/30" />

          {/* Record + Milestone */}
          <div className="text-right space-y-3">
            <div className="space-y-1">
              <Skeleton variant="text" className="w-20 h-3" />
              <Skeleton className="w-12 h-8 rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton variant="text" className="w-28 h-3" />
              <Skeleton className="w-full h-2 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
