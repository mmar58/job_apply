"use client";

import { Suspense } from "react";
import {
    Loader2Icon,
} from "lucide-react";
import JobSearchContent from "@/components/jobs/job-search-content";



export default function JobsPage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-7xl mx-auto px-4 py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <Loader2Icon className="size-8 animate-spin text-primary" />
                    <p className="text-sm">Loading jobs board...</p>
                </div>
            }
        >
            <JobSearchContent />
        </Suspense>
    );
}
