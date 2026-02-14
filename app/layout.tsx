import type { Metadata } from "next";

import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Bookmark Manager",
  description: "Manage your bookmarks with Google Sign-In",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
