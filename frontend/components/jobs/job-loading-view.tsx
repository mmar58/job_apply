export default function JobLoadingView() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="h-64 bg-card rounded-2xl sm:rounded-3xl border border-border/70 p-6 space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-2xl bg-black/5 dark:bg-white/10" />
                        <div className="space-y-2 flex-1">
                            <div className="h-4 bg-black/5 dark:bg-white/10 rounded-md w-1/3" />
                            <div className="h-5 bg-black/5 dark:bg-white/10 rounded-md w-2/3" />
                        </div>
                    </div>
                    <div className="h-4 bg-black/5 dark:bg-white/10 rounded-md w-1/2" />
                    <div className="h-12 bg-black/5 dark:bg-white/10 rounded-md w-full" />
                </div>
            ))}
        </div>
    )
}