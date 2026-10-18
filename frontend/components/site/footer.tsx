import Link from "next/link";
import { MailIcon, PhoneIcon } from "lucide-react";

const site = {
    contact: {
        email: "rahmanapu@gmail.com",
        phone: "+8801619411488",
    },
}

export default function Footer() {
    return (
        <footer className="bg-secondary">
            <div className="w-full h-32 flex items-center justify-around">
                <div>
                    <h1 className="text-2xl font-bold">AnZ Job Portal</h1>
                    <h2 className="max-w-sm">
                        AnZ Job Portal connects ambitious candidates with companies that are hiring. Browse open roles, apply in minutes and track every application.
                    </h2>
                </div>
                <div>
                    <h2>Explore</h2>
                    <ul>
                        <li>Browse Jobs</li>
                        <li>Create an account</li>
                        <li>Log in</li>
                    </ul>
                </div>
                <div>
                    <h2>Contact</h2>
                    <ul>
                        <li className="flex items-start gap-2.5">
                            <MailIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                            <a href={`mailto:${site.contact.email}`} className="hover:text-foreground">{site.contact.email}</a>
                        </li>
                        <li className="flex items-start gap-2.5">
                            <PhoneIcon className="mt-0.5 size-4 shrink-0 text-primary" />
                            <a href={`tel:${site.contact.phone.replace(/\s/g, "")}`} className="hover:text-foreground">{site.contact.phone}</a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer>
    )
}