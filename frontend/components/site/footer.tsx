import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "./logo";

const site = {
    contact: {
        email: "rahmanapu@gmail.com",
        phone: "+8801619411488",
    },
};

export default function Footer() {
    return (
        <footer className="w-full border-t border-border/60 bg-secondary/80 backdrop-blur-sm text-foreground">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12">
                    {/* Brand & Mission */}
                    <div className="sm:col-span-2 md:col-span-5 space-y-3">
                        <Logo />
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mt-3">
                            AnZ Job Portal connects ambitious candidates with companies that are hiring. Browse open roles, apply in minutes, and track every application effortlessly.
                        </p>
                    </div>

                    {/* Navigation Links */}
                    <div className="md:col-span-3 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                            Explore
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/#jobs" className="hover:text-foreground transition-colors">
                                    Browse Jobs
                                </Link>
                            </li>
                            <li>
                                <Link href="/#about" className="hover:text-foreground transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/#contact" className="hover:text-foreground transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div className="md:col-span-2 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                            Account
                        </h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>
                                <Link href="/login" className="hover:text-foreground transition-colors">
                                    Log In
                                </Link>
                            </li>
                            <li>
                                <Link href="/register" className="hover:text-foreground transition-colors">
                                    Create Account
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="md:col-span-2 space-y-3">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                            Contact
                        </h3>
                        <ul className="space-y-2.5 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Mail className="size-4 shrink-0 text-primary" />
                                <a
                                    href={`mailto:${site.contact.email}`}
                                    className="hover:text-foreground transition-colors truncate"
                                >
                                    {site.contact.email}
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="size-4 shrink-0 text-primary" />
                                <a
                                    href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                                    className="hover:text-foreground transition-colors"
                                >
                                    {site.contact.phone}
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-border/60 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>© 2026 AnZ Job Portal. All rights reserved.</p>
                    <p>Designed for fast and transparent hiring.</p>
                </div>
            </div>
        </footer>
    );
}