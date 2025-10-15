"use client"

import { useEffect, useState } from "react"
import type { RevivesResponse, Revive } from "@/lib/types"
import { ReviveCard } from "@/components/revive-card"
import { ReviveStatistics } from "@/components/revive-statistics"
import { ReviveSkillChart } from "@/components/revive-skill-chart"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
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
  const [dateFilter, setDateFilter] = useState<"all" | "7days" | "30days" | "90days">("all")
  const [itemsPerPage, setItemsPerPage] = useState(10)
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
  }, [filterType, dateFilter, itemsPerPage])

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
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revives</h1>
        <p className="text-muted-foreground">Track your Torn City revive history</p>
      </div>

      {revives && <ReviveStatistics revives={revives.revives} userId={USER_ID} correlationData={correlationData} />}

      {revives && <ReviveSkillChart revives={revives.revives} userId={USER_ID} />}

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Filter by Type</Label>
              <RadioGroup value={filterType} onValueChange={(v) => setFilterType(v as typeof filterType)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="all" />
                  <Label htmlFor="all" className="font-normal cursor-pointer">
                    All Revives
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="given" id="given" />
                  <Label htmlFor="given" className="font-normal cursor-pointer">
                    Revives Given
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="received" id="received" />
                  <Label htmlFor="received" className="font-normal cursor-pointer">
                    Revives Received
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
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

              <div className="pt-2">
                <Label className="text-sm font-medium">Items per Page</Label>
                <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number.parseInt(v))}>
                  <SelectTrigger className="mt-2">
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
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredRevives.length)} of {filteredRevives.length} revives
          </div>
        </CardContent>
      </Card>

      {paginatedRevives.length > 0 ? (
        <div className="space-y-4">
          {paginatedRevives.map((revive) => (
            <ReviveCard key={revive.id} revive={revive} />
          ))}
        </div>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground">No revives found with current filters</p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
  )
}
