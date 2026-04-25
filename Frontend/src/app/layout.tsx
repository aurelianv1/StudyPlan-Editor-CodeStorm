import "./globals.css";

export const metadata = {
  title: "StudyPlan Editor",
  description: "University Studies Plan Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#0a0a0a] text-white font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}