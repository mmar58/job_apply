import { RefreshCw, XCircle } from "lucide-react";

export default function DashboardError({
    error,
    loadDashboard,
}: {
    error: string;
    loadDashboard: () => void;
}) {
    return (
        <div className="w-full max-w-2xl mx-auto px-4 py-16 text-center">
            <div className="p-8 rounded-2xl bg-card border border-destructive/30 shadow-lg space-y-4">
                <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
                    <XCircle className="size-6" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Failed to load Dashboard</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <button
                    onClick={() => loadDashboard()}
                    className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all inline-flex items-center gap-2"
                >
                    <RefreshCw className="size-4" />
                    Try Again
                </button>
            </div>
        </div>
    )
}