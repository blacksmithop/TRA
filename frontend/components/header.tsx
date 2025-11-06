"use client"

import { useEffect } from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { removeApiKey, hasApiKey } from "@/lib/storage"
import { getLogoUrl } from "@/lib/api"
import { Heart, Menu } from "lucide-react"
import { ReviveChanceCalculator } from "@/components/revive-chance-calculator"
import { SkillGoalCalculator } from "@/components/skill-goal-calculator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const authStatus = hasApiKey()
    console.log("[v0] Header: Checking auth status", { pathname, authStatus })
    setIsAuthenticated(authStatus)

    const handleAuthChange = () => {
      const newAuthStatus = hasApiKey()
      console.log("[v0] Header: Auth change event received", { newAuthStatus })
      setIsAuthenticated(newAuthStatus)
    }

    window.addEventListener("auth-change", handleAuthChange)

    return () => {
      window.removeEventListener("auth-change", handleAuthChange)
    }
  }, [pathname]) // Re-run when pathname changes

  const handleLogout = () => {
    console.log("[v0] Header: Logout clicked")
    removeApiKey()
    router.replace("/login")
  }

  const isLoginPage = pathname === "/login"

  console.log("[v0] Header: Render state", { isClient, isLoginPage, isAuthenticated, pathname })

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
        <div className="flex items-center justify-between">
          <div className="flex-1" />

          <Link href="/" className="flex items-center gap-3">
            <Image
              src={getLogoUrl() || "/placeholder.svg"}
              alt="Torn Revive App Logo"
              width={62}
              height={62}
              unoptimized
            />
            <h1 className="text-3xl font-bold text-foreground">Torn Revive App</h1>
          </Link>

          <div className="flex flex-1 items-center justify-end gap-2">
            {isClient && !isLoginPage && isAuthenticated && (
              <TooltipProvider>
                {/* Desktop view - show all icons inline */}
                <div className="hidden md:flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <ReviveChanceCalculator />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Calculate revive success chance</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <SkillGoalCalculator />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Estimate revives to reach skill goal</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleLogout}
                        className="group relative rounded-lg p-2 transition-all hover:bg-muted"
                        aria-label="Logout"
                      >
                        <div className="relative flex items-center justify-center w-16 h-8 overflow-hidden">
                          {/* Heart icon with scale pulse animation */}
                          <Heart
                            className="absolute h-8 w-8 fill-green-500 text-green-500 transition-all group-hover:fill-red-500 group-hover:text-red-500 group-hover:animate-none animate-[heartbeat_1.5s_ease-in-out_infinite]"
                            strokeWidth={2}
                          />

                          <svg
                            className="absolute inset-0 w-16 h-8 transition-opacity group-hover:opacity-0"
                            viewBox="0 0 64 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            {/* Repeating ECG waveform pattern */}
                            <path
                              d="M-32 16 L-28 16 L-26 16.5 L-24 15.5 L-22 16 L-20 16 L-18 12 L-16 24 L-14 16 L-12 16 L-8 16 L0 16 L2 16.5 L4 15.5 L6 16 L8 16 L10 12 L12 24 L14 16 L16 16 L20 16 L28 16 L30 16.5 L32 15.5 L34 16 L36 16 L38 12 L40 24 L42 16 L44 16 L48 16 L56 16 L58 16.5 L60 15.5 L62 16 L64 16 L66 12 L68 24 L70 16 L72 16 L76 16 L84 16 L86 16.5 L88 15.5 L90 16 L92 16 L94 12 L96 24"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="animate-[ecgScroll_2s_linear_infinite]"
                            />
                          </svg>

                          {/* ECG flatline overlapping heart - hover state */}
                          <svg
                            className="absolute inset-0 w-16 h-8 opacity-0 transition-opacity group-hover:opacity-100"
                            viewBox="0 0 64 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M0 16 L64 16" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Logout</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="md:hidden">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="Menu">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-auto min-w-[60px]">
                      <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                        <div className="flex items-center justify-center cursor-pointer p-2">
                          <ReviveChanceCalculator />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild onSelect={(e) => e.preventDefault()}>
                        <div className="flex items-center justify-center cursor-pointer p-2">
                          <SkillGoalCalculator />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center justify-center p-2">
                        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes ecgScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-32px);
          }
        }
      `}</style>
    </header>
  )
}