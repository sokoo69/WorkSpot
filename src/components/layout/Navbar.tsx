"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
import { LogOut, Heart, PlusSquare, LayoutDashboard, Calendar, Search, Menu, X, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const { data: session, isPending } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (session) {
      fetch("/api/notifications")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.data);
          }
        })
        .catch(console.error);
    }
  }, [session]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await authClient.signOut();
    setIsMobileMenuOpen(false);
    router.push("/");
  };

  const isAdmin = !isPending && session && (session.user as any).role === "admin";

  const topLevelLinks = [
    { href: "/spaces", label: "Explore Spaces", icon: <Search className="w-4 h-4" />, public: true },
    { href: "/about", label: "About", icon: null, public: true },
    { href: "/spaces/add", label: "Add Space", icon: <PlusSquare className="w-4 h-4" />, public: false },
  ];

  const dropdownLinks = [
    { href: "/spaces/manage", label: "Manage Spaces", icon: null },
    { href: "/dashboard", label: t("dashboard"), icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/bookings/my", label: t("myBookings"), icon: <Calendar className="w-4 h-4" /> },
    { href: "/favorites", label: "Favorites", icon: <Heart className="w-4 h-4" /> },
  ];

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="z-50 w-full border-b border-[var(--line)] bg-[var(--base)] relative">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-2xl tracking-tight text-[var(--forest)]" onClick={() => setIsMobileMenuOpen(false)}>
          {t("brand")}
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          {topLevelLinks.map((link) => {
            if (!link.public && (!session || isPending)) return null;
            return (
              <Link key={link.href} href={link.href} className="text-sm font-medium text-[var(--ink)] hover:text-[var(--forest)] transition-colors flex items-center gap-1">
                {link.icon}
                {link.label}
              </Link>
            );
          })}

          <div className="h-6 w-px bg-[var(--line)] mx-2" />

          {!isPending && (
            <div className="flex items-center gap-4">
              {session ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-[var(--ink)]/60 hover:text-[var(--ink)] hover:bg-[var(--line)] rounded-full transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {notifications.length > 0 && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--rust)] rounded-full"></span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 bg-white border border-[var(--line)] rounded-md shadow-lg py-2 z-50 max-h-96 overflow-y-auto">
                        <div className="px-4 py-2 border-b border-[var(--line)] font-bold text-sm text-[var(--ink)]">
                          Recent Activity
                        </div>
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n.id} className="px-4 py-3 hover:bg-[var(--base)] border-b border-[var(--line)] last:border-0">
                              <div className="font-bold text-xs text-[var(--ink)] mb-1">{n.title}</div>
                              <div className="text-xs text-[var(--ink)]/80">{n.message}</div>
                              <div className="text-[10px] text-[var(--ink)]/50 mt-1">
                                {new Date(n.createdAt).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-[var(--ink)]/60 text-center">
                            No recent notifications
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <LanguageSwitcher />

                  {/* User Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-[var(--line)] hover:border-[var(--forest)] bg-[var(--base)] transition-colors"
                    >
                      <span className="text-sm font-bold text-[var(--ink)] pl-2">{session.user.name?.split(' ')[0]}</span>
                      <div className="w-7 h-7 rounded-full bg-[var(--forest)] text-[var(--base)] flex items-center justify-center text-xs font-bold">
                        {session.user.name?.charAt(0).toUpperCase()}
                      </div>
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-[var(--base)] border border-[var(--line)] rounded-md shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-[var(--line)] mb-2">
                          <div className="text-sm font-bold text-[var(--ink)]">{session.user.name}</div>
                          <div className="text-xs text-[var(--ink)]/60 truncate">{session.user.email}</div>
                        </div>

                        {dropdownLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsDropdownOpen(false)}
                            className="px-4 py-2 text-sm text-[var(--ink)] hover:bg-[var(--line)]/50 hover:text-[var(--forest)] transition-colors flex items-center gap-2"
                          >
                            {link.icon}
                            {link.label}
                          </Link>
                        ))}

                        <div className="h-px bg-[var(--line)] my-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-[var(--rust)] hover:bg-[var(--rust)]/10 transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          {t("logout")}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <LanguageSwitcher />
                  <Link
                    href="/login"
                    className="bg-[var(--forest)] text-[var(--base)] px-4 py-2 rounded-md font-bold text-sm hover:bg-[var(--forest)]/90 transition-colors"
                  >
                    {t("login")}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-[var(--ink)] hover:text-[var(--forest)] transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 top-[64px] bg-[var(--base)] z-[100] overflow-y-auto border-t border-[var(--line)]"
          style={{ height: 'calc(100dvh - 64px)' }}
        >
          <div className="p-4 flex flex-col space-y-1">
            
            {/* Anonymous Top Level: Home */}
            {!session && !isPending && (
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="px-2 py-3 text-base font-bold text-[var(--ink)] hover:text-[var(--forest)] transition-colors flex items-center gap-3">
                  <span className="text-[var(--ink)]">Home</span>
                </div>
              </Link>
            )}

            {/* Top Level Links */}
            {topLevelLinks.map((link) => {
              if (!link.public && (!session || isPending)) return null;
              return (
                <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div className="px-2 py-3 text-base font-bold text-[var(--ink)] hover:text-[var(--forest)] transition-colors flex items-center gap-3">
                    {link.icon && <span className="text-[var(--ink)] opacity-70 flex-shrink-0">{link.icon}</span>}
                    <span className="text-[var(--ink)]">{link.label}</span>
                  </div>
                </Link>
              );
            })}

            {!isPending && (
              <>
                {session ? (
                  <>
                    <div className="h-px w-full bg-[var(--line)] my-3" />
                    
                    {/* Account Dropdown Links */}
                    {dropdownLinks.map((link) => (
                      <Link key={link.href} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="px-2 py-3 text-base font-medium text-[var(--ink)] hover:text-[var(--forest)] transition-colors flex items-center gap-3">
                          {link.icon && <span className="text-[var(--ink)] opacity-70 flex-shrink-0">{link.icon}</span>}
                          <span className="text-[var(--ink)]">{link.label}</span>
                        </div>
                      </Link>
                    ))}
                    
                    <div className="h-px w-full bg-[var(--line)] my-3" />
                    
                    {/* Avatar & Logout */}
                    <div className="flex flex-col space-y-4 px-2 py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--forest)] text-[var(--base)] flex items-center justify-center text-lg font-bold flex-shrink-0">
                          {session.user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-base font-bold text-[var(--ink)] truncate">{session.user.name}</span>
                          <span className="text-xs text-[var(--ink)]/60 truncate">{session.user.email}</span>
                        </div>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-left text-sm font-bold text-[var(--rust)] hover:text-[var(--rust)]/80 transition-colors flex items-center gap-2 pt-2"
                      >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>{t("logout")}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="h-px w-full bg-[var(--line)] my-3" />
                    {/* Anonymous Auth Links */}
                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="px-2 py-3 text-base font-bold text-[var(--ink)] hover:text-[var(--forest)] transition-colors">
                        <span className="text-[var(--ink)]">{t("login")}</span>
                      </div>
                    </Link>
                    <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                      <div className="px-2 py-3 text-base font-bold text-[var(--forest)] hover:text-[var(--ink)] transition-colors">
                        <span className="text-[var(--forest)]">Register</span>
                      </div>
                    </Link>
                  </>
                )}
                
                <div className="h-px w-full bg-[var(--line)] my-3" />
                
                <div className="pt-2 px-2 flex justify-start">
                  <LanguageSwitcher />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
