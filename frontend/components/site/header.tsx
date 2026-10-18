"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Loader2Icon } from "lucide-react";
import { Logo } from "./logo";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

const navItems = [
    { href: "/#jobs", label: "Find Jobs" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" }
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
        } catch {
            toast.error("Failed to log out");
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
                    {/* Logo Section */}
                    <div className="shrink-0">
                        <Logo />
                    </div>

                    {/* Center Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors hover:underline underline-offset-4"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Right Desktop Actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                {loggingOut ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={loggingOut}
                                            className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-60 cursor-pointer"
                                        >
                                            <Loader2Icon className="size-4 animate-spin" />
                                            <span>Logging out...</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm text-foreground/80">
                                            Hi, <span className="font-semibold text-foreground">{user.name}</span>
                                        </span>
                                        <Link
                                            href="/dashboard"
                                            className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-full border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={handleLogout}
                                            disabled={loggingOut}
                                            className="inline-flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-full border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-60 cursor-pointer"
                                        >

                                            Logout
                                        </button>
                                    </>
                                )}
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-full border border-border/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="inline-flex items-center justify-center p-2 rounded-lg text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            aria-expanded={mobileMenuOpen}
                            aria-label="Toggle navigation menu"
                        >
                            {mobileMenuOpen ? (
                                <X className="size-6" />
                            ) : (
                                <Menu className="size-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur-lg px-4 pt-3 pb-6 animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col space-y-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2.5 rounded-lg text-base font-medium text-foreground/90 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="mt-4 pt-4 border-t border-border/60 grid grid-cols-2 gap-3">
                        {user ? (
                            <div className="col-span-2 flex flex-col gap-3">
                                <p className="text-sm font-medium text-foreground/80 px-1">
                                    Signed in as <span className="font-semibold text-foreground">{user.name}</span>
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="w-full inline-flex items-center justify-center text-sm font-medium py-2.5 px-4 rounded-xl border border-border bg-card/80 text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-center"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="w-full inline-flex items-center justify-center gap-2 text-sm font-medium py-2.5 px-4 rounded-xl border border-border bg-card/80 text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-center disabled:opacity-60 cursor-pointer"
                                    >
                                        {loggingOut ? (
                                            <>
                                                <Loader2Icon className="size-4 animate-spin" />
                                                <span>Logging out...</span>
                                            </>
                                        ) : (
                                            "Logout"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full inline-flex items-center justify-center text-sm font-medium py-2.5 px-4 rounded-xl border border-border bg-card/80 text-foreground hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="w-full inline-flex items-center justify-center text-sm font-medium py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center shadow-sm"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}