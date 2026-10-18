import Header from "@/components/site/header";
import Footer from "@/components/site/footer";

export default function SideLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col w-full overflow-x-clip bg-background no-scrollbar">
            <Header />
            <main className="flex-1 flex flex-col w-full">{children}</main>
            <Footer />
        </div>
    );
}