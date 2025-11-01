"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { hasApiKey, removeApiKey } from "@/lib/storage"
import type { RevivesResponse, Revive, ReviveStats, UserBarsResponse } from "@/lib/types"
import { ReviveCard } from "@/components/revive-card"
import { ReviveStatistics } from "@/components/revive-statistics"
import { ReviveSkillChart } from "@/components/revive-skill-chart"
import { EnergyBarDisplay } from "@/components/energy-bar-display"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { fetchRevivesFull, fetchReviveSkillCorrelation, fetchProfile, fetchReviveStats, fetchBars } from "@/lib/api"
import { loadRevivesProgressively } from "@/lib/progressive-loader"
import { RefreshCw, AlertCircle, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import * as XLSX from "xlsx"

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

type CategoryFilter = "All" | "PvP" | "OD" | "Crime"
type LikelihoodFilter = "All" | "Low" | "Medium" | "High" | "Very High"

export default function Home() {
  const router = useRouter()
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [revives, setRevives] = useState<RevivesResponse | null>(null)
  const [tableRevives, setTableRevives] = useState<RevivesResponse | null>(null)
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null)
  const [reviveStats, setReviveStats] = useState<ReviveStats | null>(null)
  const [barsData, setBarsData] = useState<UserBarsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccessError, setHasAccessError] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingGraph, setLoadingGraph] = useState(false)
  const [loadingRevivesList, setLoadingRevivesList] = useState(false)
  const [loadingEnergy, setLoadingEnergy] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalRevivesLoaded, setTotalRevivesLoaded] = useState(0)
  const [initialRevivesLoading, setInitialRevivesLoading] = useState(true)
  const [filterType, setFilterType] = useState<"all" | "given" | "received">("all")
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "success" | "failure">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "7days" | "30days" | "90days">("all")
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("All")
  const [likelihoodFilter, setLikelihoodFilter] = useState<LikelihoodFilter>("All")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)
  const [showFullRevives, setShowFullRevives] = useState(false)
  const [selectedReviveId, setSelectedReviveId] = useState<number | null>(null)
  const [sortField, setSortField] = useState<"skill" | "chance" | "timestamp" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)

  const categories: CategoryFilter[] = ["All", "PvP", "OD", "Crime"]
  const likelihoods: LikelihoodFilter[] = ["All", "Low", "Medium", "High", "Very High"]

  useEffect(() => {
    if (!hasApiKey()) {
      router.replace("/login")
      return
    }
  }, [router])

  useEffect(() => {
    let isMounted = true

    const loadProfile = async () => {
      try {
        const profileData: ProfileData = await fetchProfile()
        if (!isMounted) return
        if (!profileData?.profile?.id) throw new Error("Invalid profile data: missing user ID")
        setUserId(profileData.profile.id)
      } catch (err) {
        console.error("[v0] Profile fetch error:", err)
        if (err instanceof Error && err.message.includes("Access level")) setHasAccessError(true)
        if (isMounted) setLoading(false)
      }
    }

    loadProfile()
    return () => { isMounted = false }
  }, [])

  useEffect(() => {
    if (!userId) return
    let isMounted = true

    const loadRevivesData = async () => {
      try {
        const [corr, stats, bars] = await Promise.all([
          fetchReviveSkillCorrelation(userId),
          fetchReviveStats(),
          fetchBars(),
        ])

        if (!isMounted) return
        setCorrelationData(corr)
        setReviveStats(stats)
        setBarsData(bars)
        setLoading(false)
        setIsLoadingMore(true)

        loadRevivesProgressively(userId, {
          onBatchLoaded: (batch, isComplete) => {
            if (!isMounted) return
            const data: RevivesResponse = { revives: batch }
            setRevives(data)
            setTableRevives(data)
            setTotalRevivesLoaded(batch.length)
            setInitialRevivesLoading(false)
            if (isComplete) setIsLoadingMore(false)
          },
          onError: () => {
            if (!isMounted) return
            setIsLoadingMore(false)
            setInitialRevivesLoading(false)
          },
        })
      } catch (err) {
        console.error("[v0] Data fetch error:", err)
        if (isMounted) {
          setLoading(false)
          setIsLoadingMore(false)
          setInitialRevivesLoading(false)
        }
      }
    }

    loadRevivesData()

    const interval = setInterval(async () => {
      try {
        const bars = await fetchBars()
        if (isMounted) setBarsData(bars)
      } catch (_) {}
    }, 30000)

    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [userId])

  const getFilteredRevives = (): Revive[] => {
    if (!tableRevives || !userId) return []

    let list = [...tableRevives.revives]

    if (filterType === "given") list = list.filter(r => r.reviver.id === userId)
    else if (filterType === "received") list = list.filter(r => r.target.id === userId)

    if (outcomeFilter !== "all") list = list.filter(r => r.result === outcomeFilter)

    if (dateFilter !== "all") {
      const now = Date.now() / 1000
      const days = { "7days": 7, "30days": 30, "90days": 90 }[dateFilter]
      const cutoff = now - days * 86400
      list = list.filter(r => r.timestamp >= cutoff)
    }

    list = list.filter(r => {
      if (categoryFilter !== "All" && r.Category !== categoryFilter) return false
      if (likelihoodFilter !== "All" && r.Likelihood !== likelihoodFilter) return false
      return true
    })

    if (sortField && sortDirection) {
      list.sort((a, b) => {
        let aVal = 0, bVal = 0
        if (sortField === "skill") {
          aVal = a.reviver.skill ?? 0
          bVal = b.reviver.skill ?? 0
        } else if (sortField === "chance") {
          aVal = a.success_chance
          bVal = b.success_chance
        } else {
          aVal = a.timestamp
          bVal = b.timestamp
        }
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      })
    } else {
      list.sort((a, b) => b.timestamp - a.timestamp)
    }

    return list
  }

  const filteredRevives = getFilteredRevives()

  const skillGains = (() => {
    const map = new Map<number, number>()
    const mine = filteredRevives
      .filter(r => r.reviver.id === userId && r.reviver.skill != null)
      .sort((a, b) => a.timestamp - b.timestamp)

    for (let i = 1; i < mine.length; i++) {
      const gain = mine[i].reviver.skill! - mine[i - 1].reviver.skill!
      if (gain > 0) map.set(mine[i].id, gain)
    }
    return map
  })()

  const totalPages = Math.ceil(filteredRevives.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRevives = filteredRevives.slice(startIndex, endIndex)

  useEffect(() => setCurrentPage(1), [filterType, outcomeFilter, dateFilter, categoryFilter, likelihoodFilter, itemsPerPage])

  const reloadStatsAndGraph = async () => {
    if (!userId) return
    setLoadingStats(true)
    setLoadingGraph(true)
    try {
      const [corr, stats] = await Promise.all([fetchReviveSkillCorrelation(userId), fetchReviveStats()])
      setCorrelationData(corr)
      setReviveStats(stats)

      setInitialRevivesLoading(true)
      setIsLoadingMore(true)
      loadRevivesProgressively(userId, {
        onBatchLoaded: (batch, done) => {
          const data: RevivesResponse = { revives: batch }
          setRevives(data)
          setTableRevives(data)
          setTotalRevivesLoaded(batch.length)
          setInitialRevivesLoading(false)
          if (done) setIsLoadingMore(false)
        },
        onError: () => {
          setIsLoadingMore(false)
          setInitialRevivesLoading(false)
        },
      })
    } finally {
      setLoadingStats(false)
      setLoadingGraph(false)
    }
  }

  const reloadRevivesList = async () => {
    setLoadingRevivesList(true)
    try {
      if (showFullRevives) {
        const data = await fetchRevivesFull()
        setTableRevives(data)
      } else {
        setInitialRevivesLoading(true)
        setIsLoadingMore(true)
        loadRevivesProgressively(userId!, {
          onBatchLoaded: (batch, done) => {
            const data: RevivesResponse = { revives: batch }
            setRevives(data)
            setTableRevives(data)
            setTotalRevivesLoaded(batch.length)
            setInitialRevivesLoading(false)
            if (done) setIsLoadingMore(false)
          },
          onError: () => {
            setIsLoadingMore(false)
            setInitialRevivesLoading(false)
          },
        })
      }
    } finally {
      setLoadingRevivesList(false)
    }
  }

  const handleFullRevivesToggle = async (checked: boolean) => {
    setShowFullRevives(checked)
    setLoadingRevivesList(true)
    try {
      if (checked) {
        const data = await fetchRevivesFull()
        setTableRevives(data)
      } else {
        setInitialRevivesLoading(true)
        setIsLoadingMore(true)
        loadRevivesProgressively(userId!, {
          onBatchLoaded: (batch, done) => {
            const data: RevivesResponse = { revives: batch }
            setRevives(data)
            setTableRevives(data)
            setTotalRevivesLoaded(batch.length)
            setInitialRevivesLoading(false)
            if (done) setIsLoadingMore(false)
          },
          onError: () => {
            setIsLoadingMore(false)
            setInitialRevivesLoading(false)
          },
        })
      }
      setCurrentPage(1)
    } finally {
      setLoadingRevivesList(false)
    }
  }

  const handleSort = (field: "skill" | "chance" | "timestamp") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : null)
      if (sortDirection === "desc") setSortField(null)
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const exportToExcel = () => {
    if (!filteredRevives.length) return
    const rows = filteredRevives.map(r => ({
      Reviver: r.reviver.name || `[${r.reviver.id}]`,
      "Reviver Faction": r.reviver.faction?.name || "N/A",
      Skill: r.reviver.skill ?? "N/A",
      Target: r.target.name || `[${r.target.id}]`,
      "Target Faction": r.target.faction?.name || "N/A",
      "Hospitalized By": r.target.hospital_reason,
      Category: r.Category || "N/A",
      Likelihood: r.Likelihood || "N/A",
      "Success Chance": `${r.success_chance}%`,
      Outcome: r.result === "success" ? "Success" : "Failure",
      Timestamp: new Date(r.timestamp * 1000).toLocaleString(),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Revives")
    XLSX.writeFile(wb, `torn-revives-${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const SortIcon = ({ field }: { field: "skill" | "chance" | "timestamp" }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    return sortDirection === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const reloadEnergy = async () => {
    setLoadingEnergy(true)
    try {
      const bars = await fetchBars()
      setBarsData(bars)
    } finally {
      setLoadingEnergy(false)
    }
  }

  const headerGridClass = showFullRevives
    ? "grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.2fr_0.8fr_1fr_0.8fr_1fr_1.2fr] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10"
    : "grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.2fr_1fr_0.8fr_1.2fr] gap-3 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10"

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (hasAccessError) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">API Access Level Not Sufficient</h2>
              <p className="text-sm text-muted-foreground">
                Your API key does not have the required access level to use this application. Please create another one.
              </p>
            </div>
            <Button
              onClick={() => {
                removeApiKey()
                router.push("/login")
              }}
              variant="outline"
              className="mt-2"
            >
              Update API Key
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Revives</h1>
        <p className="text-muted-foreground">Track your Torn City revive history</p>
      </div>

      <Accordion type="multiple" defaultValue={["energy", "statistics", "graph", "revives"]} className="space-y-4">
        <AccordionItem value="energy" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="text-lg font-semibold">Plan</span>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); reloadEnergy() }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); reloadEnergy() } }}
                className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer ${loadingEnergy ? "pointer-events-none opacity-50" : ""}`}
              >
                <RefreshCw className={`h-4 w-4 ${loadingEnergy ? "animate-spin" : ""}`} />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {loadingEnergy ? (
              <div className="flex items-center justify-center py-8"><Spinner className="h-6 w-6" /></div>
            ) : barsData ? (
              <EnergyBarDisplay energyBar={barsData.bars.energy} />
            ) : (
              <div className="flex items-center justify-center py-8 text-muted-foreground"><p>Unable to load energy data</p></div>
            )}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="statistics" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="text-lg font-semibold">Statistics</span>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); reloadStatsAndGraph() }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); reloadStatsAndGraph() } }}
                className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer ${loadingStats ? "pointer-events-none opacity-50" : ""}`}
              >
                <RefreshCw className={`h-4 w-4 ${loadingStats ? "animate-spin" : ""}`} />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {loadingStats ? (
              <div className="flex items-center justify-center py-8"><Spinner className="h-6 w-6" /></div>
            ) : revives && userId ? (
              <ReviveStatistics revives={revives.revives} userId={userId} correlationData={correlationData} reviveStats={reviveStats} />
            ) : null}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="graph" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="text-lg font-semibold">Revive Skill Progress</span>
              <div
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); reloadStatsAndGraph() }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); reloadStatsAndGraph() } }}
                className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer ${loadingGraph ? "pointer-events-none opacity-50" : ""}`}
              >
                <RefreshCw className={`h-4 w-4 ${loadingGraph ? "animate-spin" : ""}`} />
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            {loadingGraph ? (
              <div className="flex items-center justify-center py-8"><Spinner className="h-6 w-6" /></div>
            ) : revives && userId ? (
              <ReviveSkillChart revives={revives.revives} userId={userId} />
            ) : null}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="revives" className="border rounded-lg">
          <AccordionTrigger className="px-4 hover:no-underline">
            <div className="flex items-center justify-between w-full pr-4">
              <span className="text-lg font-semibold">
                Revives
                {isLoadingMore && !initialRevivesLoading && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    (Loading... {totalRevivesLoaded} loaded)
                  </span>
                )}
              </span>
              <div className="flex items-center gap-2">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); exportToExcel() }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); exportToExcel() } }}
                  className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 cursor-pointer ${!filteredRevives.length ? "pointer-events-none opacity-50" : ""}`}
                >
                  <Download className="h-4 w-4" />
                  Export to Excel
                </div>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); reloadRevivesList() }}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); e.preventDefault(); reloadRevivesList() } }}
                  className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer ${loadingRevivesList ? "pointer-events-none opacity-50" : ""}`}
                >
                  <RefreshCw className={`h-4 w-4 ${loadingRevivesList ? "animate-spin" : ""}`} />
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-3">
            {(loadingRevivesList || initialRevivesLoading) && !tableRevives ? (
              <div className="flex items-center justify-center py-12"><Spinner className="h-8 w-8" /></div>
            ) : (
              <>
                <div className="flex items-center gap-3 pb-2 border-b">
                  <Switch id="full-revives" checked={showFullRevives} onCheckedChange={handleFullRevivesToggle} disabled={loadingRevivesList} />
                  <Label htmlFor="full-revives" className="text-sm font-medium cursor-pointer">
                    Full
                    <span className="text-xs text-muted-foreground ml-2">(Shows all revives with IDs instead of names)</span>
                  </Label>
                </div>

                <div className="flex items-end gap-2 flex-wrap">
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Filter by Type</Label>
                    <Select value={filterType} onValueChange={setFilterType as any}>
                      <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Revives</SelectItem>
                        <SelectItem value="given">Revives Given</SelectItem>
                        <SelectItem value="received">Revives Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Time Period</Label>
                    <Select value={dateFilter} onValueChange={setDateFilter as any}>
                      <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
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
                    <Select value={outcomeFilter} onValueChange={setOutcomeFilter as any}>
                      <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Outcomes</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failure">Failure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Filter by Category</Label>
                    <Select value={categoryFilter} onValueChange={(value: CategoryFilter) => setCategoryFilter(value)}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Filter by Likelihood</Label>
                    <Select value={likelihoodFilter} onValueChange={(value: LikelihoodFilter) => setLikelihoodFilter(value)}>
                      <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {likelihoods.map((lik) => (
                          <SelectItem key={lik} value={lik}>
                            {lik}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Items per Page</Label>
                    <Select value={itemsPerPage.toString()} onValueChange={v => setItemsPerPage(Number(v))}>
                      <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
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
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredRevives.length)} of {filteredRevives.length} revives
                    {isLoadingMore && !showFullRevives && (
                      <span className="ml-2 inline-flex items-center gap-1">
                        <Spinner className="h-3 w-3" />
                        <span>Loading more...</span>
                      </span>
                    )}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>Previous</Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum: number
                          if (totalPages <= 5) pageNum = i + 1
                          else if (currentPage <= 3) pageNum = i + 1
                          else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                          else pageNum = currentPage - 2 + i

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

                      <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>Next</Button>
                    </div>
                  )}
                </div>

                <Card>
                  <ScrollArea className="h-[600px]">
                    <CardContent className="p-0" onClick={e => e.target === e.currentTarget && setSelectedReviveId(null)}>
                      <div className={headerGridClass}>
                        <div>Reviver</div>
                        <div>Faction</div>
                        <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("skill")}>
                          Skill <SortIcon field="skill" />
                        </div>
                        <div>Target</div>
                        <div>Faction</div>
                        <div>Hospitalized by</div>
                        {showFullRevives && <div>Category</div>}
                        {showFullRevives && (
                          <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("chance")}>
                            Success Chance <SortIcon field="chance" />
                          </div>
                        )}
                        <div>Likelihood</div>
                        <div>Outcome</div>
                        <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => handleSort("timestamp")}>
                          Timestamp <SortIcon field="timestamp" />
                        </div>
                      </div>

                      {paginatedRevives.length > 0 ? (
                        <div>
                          {paginatedRevives.map(r => (
                            <ReviveCard
                              key={r.id}
                              revive={r}
                              showFullMode={showFullRevives}
                              skillGain={skillGains.get(r.id) ?? null}
                              isSelected={selectedReviveId === r.id}
                              onClick={() => setSelectedReviveId(r.id)}
                            />
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
              </>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}