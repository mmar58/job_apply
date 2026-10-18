"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { useRouter } from "next/navigation";
import type { AuthUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";


export default function LoginWidget() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setUser } = useAuthStore()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await request<{ user: AuthUser }>("/auth/login", {
                method: "POST",
                body: { email, password }
            });
            setUser(res.user)
            toast.success("Logged in successfully");
        } catch (error) {

            if (error instanceof ApiError) {
                setError(error.message)
            } else {
                setError("An unexpected error occurred. Please try again.")
            }
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-card text-card-foreground rounded-2xl shadow-xl border border-border/70 p-6 sm:p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome Back</h2>
                <p className="text-sm text-muted-foreground mt-1.5">Sign in to your account</p>
            </div>
            {error && (
                <div className="mt-6 my-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label htmlFor="password" className="block text-sm font-medium">
                            Password
                        </label>
                    </div>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    {loading ? <div className="flex items-center justify-center gap-4"><Loader2Icon className="animate-spin"></Loader2Icon> Logging in... </div> : "Login"}
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