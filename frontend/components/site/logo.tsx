import Link from "next/link";

export function Logo() {
    return (
        <Link href="/" className="flex items-center rounded-lg p-14">
            <span className="text-3xl font-semibold">
                AnZ <span className="text-muted-foreground whitespace-nowrap">Jobs Portal</span>
            </span>
        </Link>
    )
}