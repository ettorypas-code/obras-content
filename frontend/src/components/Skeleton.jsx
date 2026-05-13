export function SkeletonLine({ width = '100%', height = 14 }) {
  return (
    <div className="rounded-xl animate-pulse"
      style={{ width, height, background: 'var(--bg4)', minHeight: height }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl animate-pulse shrink-0" style={{ background: 'var(--bg4)' }} />
        <div className="flex-1 space-y-2">
          <SkeletonLine height={14} width="70%" />
          <SkeletonLine height={12} width="45%" />
        </div>
      </div>
      <SkeletonLine height={12} />
      <SkeletonLine height={12} width="80%" />
    </div>
  );
}

export function SkeletonListItem() {
  return (
    <div className="flex gap-3 px-4 py-3">
      <div className="w-16 h-16 rounded-xl animate-pulse shrink-0" style={{ background: 'var(--bg4)' }} />
      <div className="flex-1 space-y-2 pt-1">
        <SkeletonLine height={13} width="75%" />
        <SkeletonLine height={11} width="55%" />
        <SkeletonLine height={11} width="35%" />
      </div>
    </div>
  );
}

export function SkeletonStat() {
  return (
    <div className="card space-y-2">
      <SkeletonLine height={12} width="40%" />
      <SkeletonLine height={28} width="50%" />
      <SkeletonLine height={10} width="60%" />
    </div>
  );
}
