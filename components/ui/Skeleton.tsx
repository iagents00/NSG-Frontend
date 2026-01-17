import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "card" | "text" | "circle" | "avatar";
  animate?: boolean;
}

/**
 * Professional Skeleton Loader Component
 * Consistent with NSG Frontend design system
 */
export function Skeleton({
  className,
  variant = "default",
  animate = true,
}: SkeletonProps) {
  const baseClasses = clsx(
    "bg-linear-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%]",
    animate && "animate-skeleton-shimmer",
    "relative overflow-hidden"
  );

  const variantClasses = {
    default: "rounded-lg",
    card: "rounded-2xl sm:rounded-3xl",
    text: "rounded h-4",
    circle: "rounded-full",
    avatar: "rounded-xl sm:rounded-2xl",
  };

  return (
    <div
      className={clsx(baseClasses, variantClasses[variant], className)}
      aria-busy="true"
      aria-live="polite"
    >
      {/* Shimmer effect overlay */}
      {animate && (
        <div className="absolute inset-0 -translate-x-full animate-skeleton-slide bg-linear-to-r from-transparent via-white/60 to-transparent" />
      )}
    </div>
  );
}

/**
 * Skeleton Card - For card-based layouts
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton variant="avatar" className="w-12 h-12" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2 h-3" />
          </div>
        </div>
        <Skeleton className="w-full h-32" />
        <div className="flex gap-2">
          <Skeleton className="flex-1 h-10" />
          <Skeleton className="flex-1 h-10" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton Grid - For grid layouts
 */
export function SkeletonGrid({
  count = 4,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={clsx(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6",
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton Table - For table layouts
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="grid gap-4 p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-4" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4 p-4 sm:p-6 border-b border-slate-50 last:border-0"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton Stat Card - For metrics/statistics
 */
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200 relative overflow-hidden",
        className
      )}
    >
      <div className="absolute -right-8 -top-8 w-24 h-24 bg-slate-100 rounded-full blur-2xl opacity-50" />
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton variant="circle" className="w-10 h-10" />
          <Skeleton className="w-16 h-6 rounded-full" />
        </div>
        <Skeleton variant="text" className="w-24 h-3" />
        <Skeleton className="w-20 h-12 rounded-xl" />
        <Skeleton variant="text" className="w-32 h-3" />
      </div>
    </div>
  );
}

/**
 * Skeleton Chart - For chart placeholders
 */
export function SkeletonChart({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="w-32 h-6" />
            <Skeleton variant="text" className="w-24 h-3" />
          </div>
        </div>
        <Skeleton className="w-full h-64 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="text-center space-y-2">
              <Skeleton variant="text" className="w-16 h-3 mx-auto" />
              <Skeleton className="w-12 h-6 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
