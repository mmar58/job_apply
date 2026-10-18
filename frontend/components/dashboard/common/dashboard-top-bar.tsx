"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type TopBarOption = {
    label: string;
    type: "button" | "link";
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: React.ReactNode;
    theme?: "light" | "dark";
};

export type TopBarProps = {
    title?: string;
    header?: string;
    description?: string;
    options?: TopBarOption[];
};

export default function DashboardTopBar({
    title = "Dashboard",
    header = "Dashboard Details",
    description,
    options = [],
}: TopBarProps) {
    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-border/60">
            <div>
                {header && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
                        <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                        {header}
                    </div>
                )}
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                    {title}
                </h1>
                {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                        {description}
                    </p>
                )}
            </div>

            {options && options.length > 0 && (
                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                    {options.map((option, index) => {
                        const isDark = option.theme === "dark";
                        const baseClasses = cn(
                            "inline-flex items-center justify-center gap-2 text-sm rounded-xl px-4 py-2.5 transition-all cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                            isDark
                                ? "bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shadow-sm"
                                : "border border-border bg-card text-foreground font-medium hover:bg-black/5 dark:hover:bg-white/10"
                        );

                        if (option.type == "link") {
                            return (
                                <Link
                                    key={index}
                                    href={option.href || ""}
                                    onClick={option.onClick}
                                    className={baseClasses}
                                >
                                    {option.icon}
                                    <span>{option.label}</span>
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={index}
                                type="button"
                                onClick={option.onClick}
                                disabled={option.disabled}
                                className={baseClasses}
                            >
                                {option.icon}
                                <span>{option.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}