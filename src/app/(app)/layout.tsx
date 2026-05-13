import { BottomNav } from "@/components/bottom-nav";
import { TopNav } from "@/components/top-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <TopNav />
      <main className="pb-20 lg:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}
