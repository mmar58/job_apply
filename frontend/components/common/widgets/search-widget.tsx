import { Search } from "lucide-react";

export default function SearchWidget() {
    return (
        <form className="flex w-2/3 bg-transparent border border-black rounded-full">
            <Search className="w-5 h-5 m-2" />
            <input id="hero-search-input" className="bg-transparent justify-center outline-none flex-1" placeholder="Search for jobs" />
            <button
                type="submit"
                id="hero-search-submit"
                className="bg-black text-white px-4 py-2 rounded-full">Search</button>
        </form>
    )
}