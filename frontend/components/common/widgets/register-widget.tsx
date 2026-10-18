"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import type { AuthUser } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { toast } from "sonner";

export default function RegisterWidget() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setUser } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
        }

        try {
            const res = await request<{ user: AuthUser }>("/auth/register", {
                method: "POST",
                body: { name, email, password },
            });
            setUser(res.user);
            toast.success("Account created successfully!");
        } catch (err) {
            if (err instanceof ApiError) {
                if (err.fieldErrors) {
                    const firstMsg = Object.values(err.fieldErrors).flat()[0];
                    if (firstMsg) {
                        setError(firstMsg);
                        return;
                    }
                }
                setError(err.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-card text-card-foreground rounded-2xl shadow-xl border border-border/70 p-6 sm:p-8 backdrop-blur-sm">
            <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Create an Account</h2>
                <p className="text-sm text-muted-foreground mt-1.5">Join AnZ Job Portal to find your next opportunity</p>
            </div>

            {error && (
                <div className="my-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                        Full Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                <div>
                    <label htmlFor="reg-email" className="block text-sm font-medium mb-1.5">
                        Email
                    </label>
                    <input
                        type="email"
                        id="reg-email"
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
                    <label htmlFor="reg-password" className="block text-sm font-medium mb-1.5">
                        Password
                    </label>
                    <input
                        type="password"
                        id="reg-password"
                        name="password"
                        required
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        minLength={8}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                    />
                </div>

                <div className="flex items-start gap-2 pt-1">
                    <input
                        type="checkbox"
                        id="terms"
                        required
                        className="rounded border-border text-primary focus:ring-ring size-4 mt-0.5"
                    />
                    <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer select-none leading-tight">
                        I agree to the Terms of Service and Privacy Policy
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 active:scale-[0.99] transition-all shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 cursor-pointer"
                >
                    {loading ? (
                        <div className="flex items-center justify-center gap-2">
                            <Loader2Icon className="size-4 animate-spin" />
                            <span>Creating account...</span>
                        </div>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-foreground hover:underline">
                    Sign in
                </Link>
            </p>
        </div>
    );
}
