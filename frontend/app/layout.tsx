import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { getLogoUrl } from "@/lib/api"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Torn Revive App",
  description: "Track your Torn City revives",
  generator: "v0.app",
  icons: {
    icon: getLogoUrl(),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} flex min-h-screen flex-col`}>
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="min-h-full">
            <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
          </div>
        </main>
        <Footer />
        <Analytics />
        <Toaster />
      </body>
    </html>
  )
}