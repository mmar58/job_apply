export default function JobHeaderHero() {
    return (
        <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-foreground text-xs sm:text-sm font-medium border border-border/50">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                Verified Tech & Remote Opportunities
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                Explore Open Opportunities
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
                Search through hundreds of verified roles, filter by technical discipline, and apply directly to hiring teams.
            </p>
        </div>

    )
}