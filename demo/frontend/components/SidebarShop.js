"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Shop", href: "/shop", icon: "🛍️" },
  { label: "Cart", href: "/cart", icon: "🛒" },
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Recommender", href: "/recommender", icon: "🔍" },
  { label: "Association Rules", href: "/rules", icon: "🔗" },
  { label: "Network Graph", href: "/network", icon: "🕸️" },
];

export default function SidebarShop() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col bg-[var(--sidebar)] px-6 py-8 md:flex">
      <div className="mb-8 space-y-2">
        <div className="text-2xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            ⚡ CrossSell AI
          </span>
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          FP-Growth Engine
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-xl border-l-4 px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "border-blue-500 bg-blue-500/10 text-blue-200"
                  : "border-transparent text-[var(--text-secondary)] hover:border-blue-500/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <span className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-200">
          Powered by Apache Spark
        </span>
      </div>
    </aside>
  );
}
