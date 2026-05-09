"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Receipt, Camera, Settings } from "lucide-react";

const tabs = [
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/capture", label: "Capture", icon: Camera, highlight: true },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          const Icon = tab.icon;

          if (tab.highlight) {
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex flex-col items-center gap-0.5"
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors ${
                    isActive
                      ? "bg-brand-700 text-white"
                      : "bg-brand-600 text-white"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    isActive ? "text-brand-600" : "text-gray-500"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <Icon
                className={`h-6 w-6 transition-colors ${
                  isActive ? "text-brand-600" : "text-gray-400"
                }`}
              />
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-brand-600" : "text-gray-500"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
