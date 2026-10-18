"use client";

import { useEffect, useState } from "react";
import { X, Loader2Icon, User, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { request, ApiError } from "@/lib/api-core";
import { toast } from "sonner";

interface CandidateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface ProfileData {
    name?: string;
    headline: string | null;
    bio: string | null;
    phone: string | null;
    location?: string | null;
    address?: string | null;
    experienceYears: number;
    education: string | null;
    experience: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    skills: string[];
}

export function CandidateProfileModal({
    isOpen,
    onClose,
    onSuccess,
}: CandidateProfileModalProps) {
    const [name, setName] = useState("");
    const [headline, setHeadline] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [experienceYears, setExperienceYears] = useState(0);
    const [education, setEducation] = useState("");
    const [experience, setExperience] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [skillsInput, setSkillsInput] = useState("");

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;
        setLoading(true);
        setError(null);
        request<{ profile: ProfileData }>("/candidate/profile")
            .then((res) => {
                const p = res.profile;
                if (p) {
                    setName(p.name || "");
                    setHeadline(p.headline || "");
                    setBio(p.bio || "");
                    setPhone(p.phone || "");
                    setAddress(p.address || "");
                    setExperienceYears(p.experienceYears || 0);
                    setEducation(p.education || "");
                    setExperience(p.experience || "");
                    setLinkedinUrl(p.linkedinUrl || "");
                    setGithubUrl(p.githubUrl || "");
                    setPortfolioUrl(p.portfolioUrl || "");
                    setSkillsInput(p.skills?.join(", ") || "");
                }
            })
            .catch((err) => {
                setError(err instanceof ApiError ? err.message : "Failed to load candidate profile");
            })
            .finally(() => setLoading(false));
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSaving(true);

        const skills = skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

        const payload = {
            name: name.trim() || undefined,
            headline: headline.trim() || null,
            bio: bio.trim() || null,
            phone: phone.trim() || null,
            location: address.trim() || null,
            experienceYears: Number(experienceYears) || 0,
            education: education.trim() || null,
            experience: experience.trim() || null,
            linkedinUrl: linkedinUrl.trim() || null,
            githubUrl: githubUrl.trim() || null,
            portfolioUrl: portfolioUrl.trim() || null,
            skills,
        };

        try {
            await request("/candidate/profile", {
                method: "PUT",
                body: payload,
            });
            toast.success("Profile updated successfully!");
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof ApiError ? err.message : "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="relative w-full max-w-2xl bg-card text-card-foreground rounded-2xl sm:rounded-3xl shadow-2xl border border-border max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background/50">
                    <div className="flex items-center gap-2">
                        <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <User className="size-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-foreground">Candidate Profile</h3>
                            <p className="text-xs text-muted-foreground">Keep your background up to date to get matched faster</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                            <Loader2Icon className="size-7 animate-spin text-primary" />
                            <p className="text-sm">Loading profile data...</p>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Full Name
                                    </label>
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Alex Johnson"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Professional Headline
                                    </label>
                                    <input
                                        value={headline}
                                        onChange={(e) => setHeadline(e.target.value)}
                                        placeholder="e.g. Senior Frontend Developer | React & Next.js"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Phone Number
                                    </label>
                                    <input
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+1 (555) 000-0000"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Location / City
                                    </label>
                                    <input
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="e.g. San Francisco, CA"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Years of Experience
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="70"
                                        value={experienceYears}
                                        onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 0)}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Portfolio URL
                                    </label>
                                    <input
                                        value={portfolioUrl}
                                        onChange={(e) => setPortfolioUrl(e.target.value)}
                                        placeholder="https://myportfolio.dev"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Technical & Domain Skills (comma-separated)
                                    </label>
                                    <input
                                        value={skillsInput}
                                        onChange={(e) => setSkillsInput(e.target.value)}
                                        placeholder="React, TypeScript, Node.js, GraphQL, TailwindCSS"
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Professional Summary / Bio
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        placeholder="Brief overview of your career achievements and core strengths..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Work Experience
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={experience}
                                        onChange={(e) => setExperience(e.target.value)}
                                        placeholder="List recent positions, roles, and accomplishments..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                                        Education & Certifications
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={education}
                                        onChange={(e) => setEducation(e.target.value)}
                                        placeholder="e.g. B.S. in Computer Science, University of California..."
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/60 focus:bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 rounded-xl border border-border hover:bg-black/5 dark:hover:bg-white/10 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-2 disabled:opacity-60"
                        >
                            {saving ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Save className="size-4" />
                                    <span>Save Profile</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
