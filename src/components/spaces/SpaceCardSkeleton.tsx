export function SpaceCardSkeleton() {
  return (
    <div className="flex flex-col border border-[var(--line)] rounded-md overflow-hidden bg-[var(--base)] animate-pulse h-full">
      <div className="relative h-48 w-full bg-[var(--line)]/50"></div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-6 bg-[var(--line)]/50 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-[var(--line)]/50 rounded w-full mb-1"></div>
        <div className="h-4 bg-[var(--line)]/50 rounded w-5/6 mb-4 flex-grow"></div>
        
        <div className="flex items-center justify-between text-sm mb-4 pt-4 border-t border-[var(--line)]/50">
          <div className="h-4 bg-[var(--line)]/50 rounded w-16"></div>
          <div className="h-4 bg-[var(--line)]/50 rounded w-10"></div>
          <div className="h-4 bg-[var(--line)]/50 rounded w-16"></div>
        </div>

        <div className="h-10 bg-[var(--line)]/50 rounded w-full mt-auto"></div>
      </div>
    </div>
  );
}
