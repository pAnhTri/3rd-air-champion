import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/Navigation Bar/NavBar";

export const metadata: Metadata = {
  title: "TiBook",
  description: "Guest Booking Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="w-full h-screen flex flex-col">
        <NavBar />
        {children}
      </body>
    </html>
  );
}
