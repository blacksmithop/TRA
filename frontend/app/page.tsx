"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { hasApiKey } from "@/lib/storage"
import type { RevivesResponse, Revive, ReviveStats } from "@/lib/types"
import { ReviveCard } from "@/components/revive-card"
import { ReviveStatistics } from "@/components/revive-statistics"
import { ReviveSkillChart } from "@/components/revive-skill-chart"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { fetchRevives, fetchReviveSkillCorrelation, fetchProfile, fetchReviveStats } from "@/lib/api"

interface CorrelationData {
  correlation: number
  p_value: number
}

interface ProfileData {
  profile: {
    id: number
    name: string
    level: number
    gender: string
    status: {
      description: string
      details: string | null
      state: string
      color: string
      until: number | null
    }
  }
}

export default function Home() {
  const router = useRouter()
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [revives, setRevives] = useState<RevivesResponse | null>(null)
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null)
  const [reviveStats, setReviveStats] = useState<ReviveStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterType, setFilterType] = useState<"all" | "given" | "received">("all")
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "success" | "failure">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "7days" | "30days" | "90days">("all")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (!hasApiKey()) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        console.log("[v0] Fetching user profile...")
        const profileData: ProfileData = await fetchProfile()
        console.log("[v0] Profile fetched successfully:", profileData)

        if (!isMounted) return

        if (!profileData?.profile?.id) {
          throw new Error("Invalid profile data: missing user ID")
        }

        const fetchedUserId = profileData.profile.id
        console.log("[v0] Setting userId to:", fetchedUserId)
        setUserId(fetchedUserId)
      } catch (err) {
        console.error("[v0] Profile fetch error:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load user profile")
          setLoading(false)
        }
      }
    }

    loadProfile()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (typeof userId !== "number" || userId <= 0) {
      console.log("[v0] Waiting for valid userId. Current value:", userId)
      return
    }

    let isMounted = true

    const loadRevivesData = async () => {
      try {
        console.log("[v0] Fetching revives, correlation, and stats with userId:", userId)

        const [revivesData, correlationData, statsData] = await Promise.all([
          fetchRevives(),
          fetchReviveSkillCorrelation(userId),
          fetchReviveStats(),
        ])

        console.log("[v0] Data fetched successfully")
        console.log("[v0] Revive stats:", statsData)

        if (isMounted) {
          setRevives(revivesData)
          setCorrelationData(correlationData)
          setReviveStats(statsData)
          setLoading(false)
        }
      } catch (err) {
        console.error("[v0] Data fetch error:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load revives data")
          setLoading(false)
        }
      }
    }

    loadRevivesData()

    return () => {
      isMounted = false
    }
  }, [userId])

  const getFilteredRevives = (): Revive[] => {
    if (!revives || !userId) return []

    let filtered = [...revives.revives]

    if (filterType === "given") {
      filtered = filtered.filter((r) => r.reviver.id === userId)
    } else if (filterType === "received") {
      filtered = filtered.filter((r) => r.target.id === userId)
    }

    if (outcomeFilter !== "all") {
      filtered = filtered.filter((r) => r.result === outcomeFilter)
    }

    if (dateFilter !== "all") {
      const now = Date.now() / 1000
      const daysMap = { "7days": 7, "30days": 30, "90days": 90 }
      const days = daysMap[dateFilter]
      const cutoff = now - days * 24 * 60 * 60
      filtered = filtered.filter((r) => r.timestamp >= cutoff)
    }

    return filtered.sort((a, b) => b.timestamp - a.timestamp)
  }

  const filteredRevives = getFilteredRevives()

  const totalPages = Math.ceil(filteredRevives.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRevives = filteredRevives.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, dateFilter, itemsPerPage, outcomeFilter])

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-destructive">Error loading revives</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revives</h1>
        <p className="text-muted-foreground">Track your Torn City revive history</p>
      </div>

      <Accordion type="multiple" defaultValue={["statistics", "graph", "revives"]} className="space-y-4">
        {/* First Accordion: Statistics Cards Only */}
        <AccordionItem value="statistics" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="text-lg font-semibold">Statistics</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {revives && userId && (
              <ReviveStatistics
                revives={revives.revives}
                userId={userId}
                correlationData={correlationData}
                reviveStats={reviveStats}
              />
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Second Accordion: Graph Only */}
        <AccordionItem value="graph" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="text-lg font-semibold">Revive Skill Progress</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {revives && userId && <ReviveSkillChart revives={revives.revives} userId={userId} />}
          </AccordionContent>
        </AccordionItem>

        {/* Third Accordion: Revives List */}
        <AccordionItem value="revives" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="text-lg font-semibold">Revives</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Filter by Type</Label>
                <Select value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Revives</SelectItem>
                    <SelectItem value="given">Revives Given</SelectItem>
                    <SelectItem value="received">Revives Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Time Period</Label>
                <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as typeof dateFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Filter by Outcome</Label>
                <Select value={outcomeFilter} onValueChange={(v) => setOutcomeFilter(v as typeof outcomeFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Outcomes</SelectItem>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="failure">Failure</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Items per Page</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number.parseInt(v))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredRevives.length)} of {filteredRevives.length}{" "}
                revives
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>

            <Card>
              <ScrollArea className="h-[600px]">
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.5fr_0.8fr_0.8fr_1.2fr] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10">
                    <div>Reviver</div>
                    <div>Faction</div>
                    <div>Skill</div>
                    <div>Target</div>
                    <div>Faction</div>
                    <div>Hospitalized by</div>
                    <div>Chance</div>
                    <div>Outcome</div>
                    <div>Timestamp</div>
                  </div>

                  {paginatedRevives.length > 0 ? (
                    <div>
                      {paginatedRevives.map((revive) => (
                        <ReviveCard key={revive.id} revive={revive} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex min-h-[200px] items-center justify-center">
                      <p className="text-muted-foreground">No revives found with current filters</p>
                    </div>
                  )}
                </CardContent>
              </ScrollArea>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
