export default function DashboardSkelton() {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-60 bg-card/80 rounded-xl" />
                    <div className="h-4 w-96 bg-card/50 rounded-lg" />
                </div>
                <div className="flex gap-3">
                    <div className="h-10 w-28 bg-card rounded-xl" />
                    <div className="h-10 w-36 bg-card rounded-xl" />
                </div>
            </div>

            {/* Cards skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-32 bg-card rounded-2xl border border-border/70" />
                ))}
            </div>

            {/* Panels skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-96 bg-card rounded-2xl border border-border/70" />
                <div className="h-96 bg-card rounded-2xl border border-border/70" />
            </div>
        </div>
    )
}