import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UPLB TRAIL: Resource Access & Information Links",
  description: "Terminal for Resource Access and Information Links for the University of the Philippines Los Baños.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-[#fafafa]">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased text-foreground bg-[#fafafa] min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
