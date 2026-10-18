import Link from "next/link";
import { Logo } from "./logo";

const nav = [
    { href: "/#jobs", label: "Find Jobs" },
    { href: "/#about", label: "About" },
    { href: "/#contact", label: "Contact" }
];

export default function Header() {
    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-sm">
            {/* Added h-16 for height and items-center to vertically center everything */}
            <div className="flex items-center h-24 px-4 container mx-auto">

                {/* Left Section: Logo takes up equal space (flex-1) */}
                <div className="flex-1">
                    <Logo />
                </div>

                {/* Center Section: Navbar sits exactly in the middle */}
                <nav className="flex-none">
                    {/* Added gap-6 to visually space out your links */}
                    <ul className="flex items-center gap-6">
                        {nav.map((item) => (
                            <li key={item.href}>
                                <Link href={item.href} className="text-md font-medium transition-colors hover:text-primary p-2 hover:bg-blend-darken">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Right Section: Empty spacer balances the left section so the center stays perfectly centered */}
                <div className="flex flex-1 gap-2 justify-end mr-[5%]">
                    <Link href="/login" className="text-md font-medium transition-colors hover:text-primary rounded-full p-2 hover:ring-2">
                        Login
                    </Link>
                    <Link href="/register" className="text-md font-medium transition-colors hover:text-primary ring-gray-400 ring-2 rounded-full p-2 hover:ring-black">
                        Register
                    </Link>
                </div>

            </div>
        </header>
    )
}