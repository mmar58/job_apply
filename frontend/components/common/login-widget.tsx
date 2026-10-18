"use client";

import Link from "next/link";

export default function LoginWidget() {
    return (
        <div className="w-full max-w-md mx-auto bg-card text-card-foreground rounded-2xl shadow-xl border border-border/70 p-6 sm:p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-1.5">Sign in to your account</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        autoComplete="email"
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="block text-sm font-medium">
                            Password
                        </label>
                        <a
                            href="#forgot-password"
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Forgot password?
                        </a>
                    </div>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        autoComplete="current-password"
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="remember-me"
                        className="rounded border-border text-primary focus:ring-ring size-4"
                    />
                    <label htmlFor="remember-me" className="text-xs sm:text-sm text-muted-foreground cursor-pointer select-none">
                        Remember me for 30 days
                    </label>
                </div>

                <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    Login
                </button>
            </form>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-semibold text-foreground hover:underline">
                    Create an account
                </Link>
            </p>
        </div>
    );
}