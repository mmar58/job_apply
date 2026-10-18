"use client";

import { Search } from "lucide-react";

export default function SearchWidget() {
    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="w-full max-w-xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-1.5 sm:p-2 bg-card rounded-2xl sm:rounded-full border border-border shadow-md focus-within:ring-2 focus-within:ring-ring/50 transition-all"
        >
            <div className="flex items-center flex-1 px-2.5 py-1">
                <Search className="size-5 text-muted-foreground shrink-0 mr-2" />
                <input
                    id="hero-search-input"
                    className="w-full bg-transparent text-sm sm:text-base outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="Search by role, company, or keyword..."
                />
            </div>
            <button
                type="submit"
                id="hero-search-submit"
                className="shrink-0 px-6 py-2.5 sm:py-2 rounded-xl sm:rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
            >
                Search
            </button>
        </form>
    );
}