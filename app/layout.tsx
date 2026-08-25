import "./globals.css";
import { Providers } from "./components/Providers";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "TruthLens — Evidence-first news verification",
  description:
    "Audit headlines and screenshots against official sources, wires, and certified fact-checkers. Streaming verdicts with sources, bias, and audit trails.",
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
