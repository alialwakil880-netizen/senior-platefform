import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SENIOR Platform — Mr. Ali Alwakil | English Language Education",
  description:
    "The premier educational platform by Mr. Ali Alwakil. HD video lessons, interactive quizzes, and comprehensive English curricula for preparatory and secondary students.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${inter.variable} ${cairo.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
