import SearchWidget from "../common/widgets/search-widget";

export default function HeroSection() {
    return (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-20 md:py-28 flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-foreground text-xs sm:text-sm font-medium mb-6 border border-border/50">
                    <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    Over 500+ active tech & remote roles
                </div>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                    Find work that fits you
                </h1>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-10 px-2">
                    AnZ Job Portal connects ambitious candidates with companies that are hiring. Browse open roles, apply in minutes, and track every application.
                </p>
                <SearchWidget />
            </div>
        </section>
    );
}