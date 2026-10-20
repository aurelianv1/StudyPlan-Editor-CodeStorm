import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudyPlan Editor",
  description: "University Studies Plan Management",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0a] text-white font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
