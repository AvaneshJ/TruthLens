import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { SessionProvider } from "./components/SessionProvider";
import { AuthProvider } from "./context/AuthContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import { TruthThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "TruthLens — AI News Authenticator",
  description: "AI-powered news verification and fact-checking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SessionProvider>
          <ThemeProvider>
            <TruthThemeProvider>
              <AuthProvider>
                <AnalysisProvider>
                  <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg-base)" }}>
                    <Navbar />
                    <main style={{ flex: 1 }}>
                      {children}
                    </main>
                    <Footer />
                  </div>
                </AnalysisProvider>
              </AuthProvider>
            </TruthThemeProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
