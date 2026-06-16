import type { Metadata } from "next";
import { Inter, Noto_Sans_Thai, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});
const notoThai = Noto_Sans_Thai({
  subsets: ["thai"],
  variable: "--font-thai",
  weight: ["300", "400", "500", "600", "700"],
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "HairMaster Pro - ระบบจัดการร้านทำผม",
  description: "ระบบจัดการบทเรียน สูตรสี และผลิตภัณฑ์สำหรับช่างทำผมมืออาชีพ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${notoThai.variable} ${mono.variable} antialiased`}
        style={{ fontFamily: "'Noto Sans Thai', 'Inter', sans-serif" }}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange={false}>
          <WorkspaceProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
