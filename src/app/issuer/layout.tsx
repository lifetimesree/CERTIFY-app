"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus2, LogOut, ShieldCheck } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { generateKeyPair, importPublicKey } from "@/lib/crypto";
import { useCertStore } from "@/lib/store";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function IssuerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { issuerKeys, setKeys, previewTheme } = useCertStore();
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Initialize keys if they don't exist
  useEffect(() => {
    async function initKeys() {
      if (!issuerKeys.privateKeyJwk || !issuerKeys.publicKeyJwk) {
        const { publicKeyJwk, privateKeyJwk } = await generateKeyPair();
        setKeys(publicKeyJwk, privateKeyJwk);
      }
      setLoading(false);
    }
    initKeys();
  }, [issuerKeys, setKeys]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Initializing secure session...</div>;
  }

  const navItems = [
    { href: "/issuer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/issuer/issue", label: "Issue Credential", icon: FilePlus2 },
  ];

  const layoutBg = "bg-gray-50";
  const sidebarBg = "bg-white border-gray-200";
  const sidebarHeaderBorder = "border-gray-100";
  const sidebarLogo = "text-black";
  const sidebarSection = "text-gray-400";
  const navBase = "text-gray-600 hover:bg-gray-50 hover:text-gray-900";
  const navActive = "bg-gray-100 text-gray-900";

  return (
    <div className={`flex min-h-screen ${layoutBg} transition-colors duration-500 overflow-hidden relative`}>
      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col hidden md:flex transition-colors duration-500 relative z-10 ${sidebarBg}`}>
        <div className={`h-16 flex items-center px-6 border-b ${sidebarHeaderBorder}`}>
          <Link href="/" className={`flex items-center gap-2 font-bold text-lg ${sidebarLogo}`}>
            <ShieldCheck className={sidebarLogo} />
            CERTIFY
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <div className={`text-xs font-semibold mb-4 px-2 uppercase tracking-wider ${sidebarSection}`}>
            Issuer Portal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive ? navActive : navBase
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Mobile header could go here */}
        <div className="p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
