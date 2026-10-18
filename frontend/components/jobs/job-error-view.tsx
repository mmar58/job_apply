import { RotateCcw } from "lucide-react";

export default function JobErrorView({ error, fetchJobs }: { error: string; fetchJobs: () => void }) {
    return (
        <div className="p-12 text-center rounded-2xl bg-card border border-destructive/30 max-w-lg mx-auto space-y-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <button
                onClick={() => fetchJobs()}
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all inline-flex items-center gap-2"
            >
                <RotateCcw className="size-4" />
                <span>Retry</span>
            </button>
        </div>
    )
}