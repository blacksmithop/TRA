"use client"

import { useEffect, useState } from "react"
import type { RevivesResponse, Revive } from "@/lib/types"
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
import { fetchRevives, fetchReviveSkillCorrelation } from "@/lib/api"

const USER_ID = 1712955

interface CorrelationData {
  correlation: number
  p_value: number
}

export default function RevivesPage() {
  const [revives, setRevives] = useState<RevivesResponse | null>(null)
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [filterType, setFilterType] = useState<"all" | "given" | "received">("all")
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "success" | "failure">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "7days" | "30days" | "90days">("all")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const loadRevives = async () => {
      try {
        const [revivesData, correlationData] = await Promise.all([fetchRevives(), fetchReviveSkillCorrelation()])
        setRevives(revivesData)
        setCorrelationData(correlationData)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    loadRevives()
  }, [])

  const getFilteredRevives = (): Revive[] => {
    if (!revives) return []

    let filtered = [...revives.revives]

    if (filterType === "given") {
      filtered = filtered.filter((r) => r.reviver.id === USER_ID)
    } else if (filterType === "received") {
      filtered = filtered.filter((r) => r.target.id === USER_ID)
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

      <Accordion type="multiple" defaultValue={["statistics", "revives"]} className="space-y-4">
        <AccordionItem value="statistics" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <span className="text-lg font-semibold">Statistics</span>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {revives && (
              <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
                <ReviveStatistics revives={revives.revives} userId={USER_ID} correlationData={correlationData} />
                <ReviveSkillChart revives={revives.revives} userId={USER_ID} />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

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
                  <div className="grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.5fr_0.8fr_1.2fr] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10">
                    <div>Reviver</div>
                    <div>Faction</div>
                    <div>Skill</div>
                    <div>Target</div>
                    <div>Faction</div>
                    <div>Hospitalized by</div>
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
