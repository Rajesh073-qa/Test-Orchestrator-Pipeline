import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "../components/providers/query-provider";
import Navbar from "../components/navbar";
import { ToastProvider } from "../components/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Test Orchestrator | AI-Powered QA",
  description: "Generate test plans and automation code with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <ToastProvider>
            <Navbar />
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}


