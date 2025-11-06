"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { removeApiKey, hasApiKey } from "@/lib/storage"
import { getLogoUrl } from "@/lib/api"
import { Heart, Menu, ChevronUp, ChevronDown, Calculator, Target, LogOut, HelpCircle } from "lucide-react"
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)

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
  }, [pathname])

  const handleLogout = () => {
    console.log("[v0] Header: Logout clicked")
    removeApiKey()
    router.replace("/login")
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const handleToolClick = (tool: string) => {
    setActiveTool(tool)
  }

  const closeTool = () => {
    setActiveTool(null)
  }

  const isLoginPage = pathname === "/login"

  console.log("[v0] Header: Render state", { isClient, isLoginPage, isAuthenticated, pathname })

  return (
    <>
      <header className={`
        border-b border-border bg-card sticky top-0 z-50
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'py-1' : 'py-4'}
      `}>
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Centered Logo and Title */}
            <div className="flex-1" /> {/* Spacer for left side */}
            
            <Link href="/" className="flex items-center gap-3 transition-all duration-300 mx-auto">
              <Image
                src={getLogoUrl() || "/placeholder.svg"}
                alt="Torn Revive App Logo"
                width={isCollapsed ? 40 : 62}
                height={isCollapsed ? 40 : 62}
                unoptimized
                className="transition-all duration-300"
              />
              <h1 className={`font-bold text-foreground transition-all duration-300 ${
                isCollapsed ? 'text-xl' : 'text-3xl'
              }`}>
                Torn Revive App
              </h1>
            </Link>

            {/* Right side - Dropdown menu */}
            <div className="flex-1 flex items-center justify-end gap-2">
              {isClient && !isLoginPage && isAuthenticated && (
                <TooltipProvider>
                  <div className="flex items-center gap-2">
                    {/* Collapse toggle button */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleCollapse}
                          className="h-9 w-9"
                          aria-label={isCollapsed ? "Expand header" : "Collapse header"}
                        >
                          {isCollapsed ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronUp className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isCollapsed ? "Expand header" : "Collapse header"}</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Main dropdown menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Menu">
                          <Menu className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {/* Calculator - Direct trigger */}
                        <DropdownMenuItem 
                          onClick={() => handleToolClick('calculator')}
                          className="flex items-center gap-3 cursor-pointer p-3"
                        >
                          <Calculator className="h-4 w-4 shrink-0" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium">Revive Chance Calculator</span>
                            <span className="text-xs text-muted-foreground">
                              Calculate success chance
                            </span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Goal - Direct trigger */}
                        <DropdownMenuItem 
                          onClick={() => handleToolClick('goal')}
                          className="flex items-center gap-3 cursor-pointer p-3"
                        >
                          <Target className="h-4 w-4 shrink-0" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium">Skill Goal Calculator</span>
                            <span className="text-xs text-muted-foreground">
                              Estimate revives needed
                            </span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Help Modal */}
                        <DropdownMenuItem 
                          onClick={() => handleToolClick('help')}
                          className="flex items-center gap-3 cursor-pointer p-3"
                        >
                          <HelpCircle className="h-4 w-4 shrink-0" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium">Help</span>
                            <span className="text-xs text-muted-foreground">
                              App guide and information
                            </span>
                          </div>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Logout */}
                        <DropdownMenuItem 
                          onClick={handleLogout}
                          className="flex items-center gap-3 cursor-pointer p-3 text-red-600 dark:text-red-400"
                        >
                          <LogOut className="h-4 w-4 shrink-0" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium">Logout</span>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TooltipProvider>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Calculator Tool */}
      {activeTool === 'calculator' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Revive Chance Calculator</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeTool}
                  className="h-8 w-8"
                >
                  <span className="sr-only">Close</span>
                  <span aria-hidden="true">×</span>
                </Button>
              </div>
              <ReviveChanceCalculator />
            </div>
          </div>
        </div>
      )}

      {/* Goal Tool */}
      {activeTool === 'goal' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Skill Goal Calculator</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeTool}
                  className="h-8 w-8"
                >
                  <span className="sr-only">Close</span>
                  <span aria-hidden="true">×</span>
                </Button>
              </div>
              <SkillGoalCalculator />
            </div>
          </div>
        </div>
      )}

      {/* Help Tool */}
      {activeTool === 'help' && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">App Guide & Help</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeTool}
                  className="h-8 w-8"
                >
                  <span className="sr-only">Close</span>
                  <span aria-hidden="true">×</span>
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Revive Chance Calculator</h4>
                  <p className="text-sm text-muted-foreground">
                    Calculate your chance of successfully reviving other players based on your 
                    current stats and equipment.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Skill Goal Calculator</h4>
                  <p className="text-sm text-muted-foreground">
                    Estimate how many revives you need to perform to reach your desired skill level.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Revive Tracking</h4>
                  <p className="text-sm text-muted-foreground">
                    View your complete revive history with detailed statistics, graphs, and energy planning.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Getting Started</h4>
                  <p className="text-sm text-muted-foreground">
                    Make sure your API key has the proper permissions to access revive data. 
                    The app will automatically sync your revive history when you log in.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}