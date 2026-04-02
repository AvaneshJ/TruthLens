import Link from "next/link";
import {
  History,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

export default function NavBar({
  theme,
  setTheme,
  session,
  signOut,
  onReset,
}: any) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-2 sm:px-4 py-3 max-w-6xl mx-auto backdrop-blur-md bg-slate-50/80 dark:bg-[#0f172a]/80">
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 sm:gap-2 font-bold hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
            <ShieldCheck className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
          </div>
        </div>
        <span className="font-bold text-base sm:text-xl tracking-tight">
          TruthLens
        </span>
      </button>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/history"
          className="p-2 sm:px-3 sm:py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm hover:border-blue-500 transition-all"
        >
          <History size={16} className="text-slate-400" />
        </Link>

        <div className="hidden sm:flex items-center gap-2">
          {session?.user ? (
            <button
              onClick={() => signOut({ callbackUrl: "/dashboard" })}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105 text-slate-400 hover:text-red-500"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-sm text-sm font-medium hover:border-blue-500 transition-all"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-sm text-sm font-bold hover:bg-blue-700 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 sm:p-3 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm transition-transform hover:scale-105"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-yellow-400" />
          ) : (
            <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-blue-600" />
          )}
        </button>

        <div className="relative sm:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm"
          >
            {mobileMenuOpen ? (
              <X size={20} className="text-slate-600 dark:text-slate-300" />
            ) : (
              <Menu size={20} className="text-slate-600 dark:text-slate-300" />
            )}
          </button>
          {mobileMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl shadow-xl overflow-hidden z-50">
              {session?.user ? (
                <button
                  onClick={() => {
                    signOut({ callbackUrl: "/dashboard" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-slate-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut size={16} /> Logout
                </button>
              ) : (
                <div className="flex">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-3 text-center text-sm font-medium text-slate-600 border-r border-slate-200"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex-1 px-4 py-3 text-center text-sm font-bold text-blue-600"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
