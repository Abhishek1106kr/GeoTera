"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, RefreshCw, Menu, X } from "lucide-react";
import { useState } from "react";
import LiveBadge from "./LiveBadge";
import { useGeoTera } from "@/lib/GeoTeraContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/economics", label: "Economics" },
  { href: "/news", label: "News" },
  { href: "/climate", label: "Climate" },
  { href: "/population", label: "Population" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  const { status, refresh, data } = useGeoTera();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#060b18]/85 backdrop-blur-xl">
      <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Globe size={16} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight">
            <span className="text-cyan-400">Geo</span>
            <span className="text-white">Tera</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {data?.last_updated && (
            <span className="hidden lg:block text-xs text-gray-600 tabular-nums">
              Updated {new Date(data.last_updated).toLocaleTimeString()}
            </span>
          )}
          <LiveBadge status={status} />
          <button
            onClick={refresh}
            title="Force refresh"
            className="p-2 rounded-lg border border-white/10 hover:border-cyan-500/30 text-gray-500 hover:text-cyan-400 transition-all"
          >
            <RefreshCw size={13} />
          </button>
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#060b18] px-6 py-3 flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === link.href
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
