import SearchWidget from "../common/widgets/search-widget";

export default function HeroSection() {
    return (
        <div className="w-full h-96 flex items-center justify-center">
            <div className="w-2/4 flex flex-col items-center justify-center">
                <h1 className="text-6xl font-bold">Find work that fits you</h1>
                <h2 className="p-[10%] py-[10px] text-lg text-justify">AnZ Job Portal connects ambitious candidates with companies that are hiring. Browse open roles, apply in minutes and track every application.</h2>
                <SearchWidget />
            </div>
        </div>
    )
}