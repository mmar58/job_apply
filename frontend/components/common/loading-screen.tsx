import { Loader2Icon } from "lucide-react";
interface LoadingScreenProps {
    message?: string;
    subtext?: string;
}

export default function LoadingScreen({
    message = "AnZ Jobs Portal",
    subtext = "Preparing your experience...",
}: LoadingScreenProps) {
    return (
        <div className="h-screen inset-0 flex flex-col items-center justify-center bg-background/95 backdrop-blur-md px-4 select-none overflow-hidden">


            <div className="relative z-10 flex flex-col text-center max-w-sm mb-[10%]">

                {/* Branded Title */}
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    {message}
                </h2>

                {/* Animated Subtext */}
                <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 mb-6 animate-pulse">
                    {subtext}
                </p>

                {/* Modern Indeterminate Progress Bar */}
                <div className="flex items-center gap-2 justify-center">
                    <Loader2Icon className="animate-spin"></Loader2Icon> Loading ...
                </div>
            </div>
        </div>
    );
}