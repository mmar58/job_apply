import { ChevronLeft, ChevronRight } from "lucide-react";
type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}
export default function PaginationWidget({ currentPage, totalPages, onPageChange }: PaginationProps) {
    return (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-border/60">
            <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
                <ChevronLeft className="size-4" />
                <span>Previous</span>
            </button>

            <span className="text-xs sm:text-sm font-medium text-muted-foreground px-2">
                Page <strong className="text-foreground">{currentPage}</strong> of{" "}
                <strong className="text-foreground">{totalPages}</strong>
            </span>

            <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
            >
                <span>Next</span>
                <ChevronRight className="size-4" />
            </button>
        </div>
    )
}