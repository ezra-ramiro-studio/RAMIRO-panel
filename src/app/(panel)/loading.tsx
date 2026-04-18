import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Skeleton className="h-[14px] w-6" />
        <Skeleton className="h-[14px] w-40" />
      </div>

      <Skeleton className="h-10 w-80" rounded="rounded-[8px]" />

      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24" rounded="rounded-[10px]" />
        ))}
      </div>

      <div className="bg-surface border border-border-2 rounded-[10px] p-6">
        <Skeleton className="h-4 w-48 mb-5" />
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonRow key={i} cols={5} />
        ))}
      </div>
    </div>
  );
}
