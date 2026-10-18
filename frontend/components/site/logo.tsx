import Link from "next/link";

export function Logo() {
    return (
        <Link href="/" className="inline-flex items-center gap-2.5 group py-1">
            <div className="flex size-9 sm:size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-base sm:text-lg shadow-sm transition-transform group-hover:scale-105">
                AnZ
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                Jobs <span className="text-muted-foreground font-medium">Portal</span>
            </span>
        </Link>
    );
}