import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: number | string;
    subtitle?: React.ReactNode;
    icon: React.ReactNode;
    iconBg?: string;
    className?: string;
}

export function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconBg = "bg-primary/10 text-primary",
    className,
}: StatCardProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden bg-card text-card-foreground rounded-2xl border border-border/70 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between",
                className
            )}
        >
            <div className="flex items-center justify-between gap-4">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    {title}
                </span>
                <div
                    className={cn(
                        "size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                        iconBg
                    )}
                >
                    {icon}
                </div>
            </div>

            <div className="mt-3 sm:mt-4">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {typeof value === "number" ? value.toLocaleString() : value}
                </div>
                {subtitle && (
                    <div className="mt-2 text-xs text-muted-foreground flex flex-wrap items-center gap-1.5">
                        {subtitle}
                    </div>
                )}
            </div>
        </div>
    );
}
