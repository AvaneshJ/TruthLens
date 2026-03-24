import "./globals.css";
import { Providers } from "./components/Providers";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "TruthLens — AI News Authenticator",
  description: "AI-powered news verification and fact-checking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
