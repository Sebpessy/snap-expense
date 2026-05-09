import { BottomNav } from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <main className="pb-20 lg:pb-0">{children}</main>
      <BottomNav />
    </div>
  );
}
