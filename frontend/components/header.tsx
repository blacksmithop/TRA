"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, HeartPulse } from "lucide-react"

export function Header() {
  const pathname = usePathname()

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-1" />

          <Link href="/" className="flex items-center gap-3">
            <div className="text-3xl">⚕️</div>
            <h1 className="text-xl font-bold text-foreground">Torn Revive</h1>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2">
            <Button variant="ghost" size="icon" asChild className={pathname === "/" ? "bg-accent" : ""}>
              <Link href="/" title="Dashboard">
                <Home className="h-5 w-5" />
              </Link>
            </Button>

            <Button variant="ghost" size="icon" asChild className={pathname === "/revives" ? "bg-accent" : ""}>
              <Link href="/revives" title="Revives">
                <HeartPulse className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
