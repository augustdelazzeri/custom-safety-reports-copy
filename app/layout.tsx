import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../src/components/Providers";
import OnboardingWidget from "../src/components/OnboardingWidget";

export const metadata: Metadata = {
  title: "UpKeep EHS - Safety Events",
  description: "Custom Safety Event Forms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          {children}
          <OnboardingWidget />
        </Providers>
      </body>
    </html>
  );
}
