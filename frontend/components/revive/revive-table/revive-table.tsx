"use client"

import { useState, useEffect, useMemo } from "react"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { Download, RefreshCw } from "lucide-react"
import * as XLSX from "xlsx"
import { ReviveTableFilters } from "./revive-table-filters"
import { ReviveTablePagination } from "./revive-table-pagination"
import { ReviveTableHeader } from "./revive-table-header"
import { ReviveTableRow } from "./revive-table-row"
import type { RevivesResponse, Revive } from "@/lib/types"

interface Props {
  userId: number
  revives: RevivesResponse | null
  showFullRevives: boolean
  isLoadingMore: boolean
  totalRevivesLoaded: number
  initialRevivesLoading: boolean
  onFullToggle: (checked: boolean) => void
  onRefresh: () => void
}

export function ReviveTable({
  userId,
  revives,
  showFullRevives,
  isLoadingMore,
  totalRevivesLoaded,
  initialRevivesLoading,
  onFullToggle,
  onRefresh,
}: Props) {
  const [filterType, setFilterType] = useState<"all" | "given" | "received">("all")
  const [dateFilter, setDateFilter] = useState<"all" | "7days" | "30days" | "90days">("all")
  const [categoryFilter, setCategoryFilter] = useState<"All" | "PvP" | "OD" | "Crime">("All")
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReviveId, setSelectedReviveId] = useState<number | null>(null)
  const [sortField, setSortField] = useState<"skill" | "chance" | "timestamp" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(null)

  // Header filters
  const [reviverNameFilter, setReviverNameFilter] = useState("")
  const [targetNameFilter, setTargetNameFilter] = useState("")
  const [reviverFactionFilter, setReviverFactionFilter] = useState("")
  const [targetFactionFilter, setTargetFactionFilter] = useState("")
  const [successPercentFilter, setSuccessPercentFilter] = useState<"All" | "Low" | "Medium" | "High" | "Very High">("All")
  const [outcomeFilter, setOutcomeFilter] = useState<"all" | "success" | "failure">("all")

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [
    filterType,
    dateFilter,
    categoryFilter,
    successPercentFilter,
    itemsPerPage,
    reviverNameFilter,
    targetNameFilter,
    reviverFactionFilter,
    targetFactionFilter,
    outcomeFilter,
  ])

  // Filter + sort
  const getFilteredRevives = useMemo((): Revive[] => {
    if (!revives || !userId) return []

    let list = [...revives.revives]

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
      if (successPercentFilter !== "All" && r.Likelihood !== successPercentFilter) return false
      if (reviverNameFilter && !(r.reviver.name || r.reviver.id.toString()).toLowerCase().includes(reviverNameFilter.toLowerCase())) return false
      if (targetNameFilter && !(r.target.name || r.target.id.toString()).toLowerCase().includes(targetNameFilter.toLowerCase())) return false
      if (reviverFactionFilter && !(r.reviver.faction?.name || "").toLowerCase().includes(reviverFactionFilter.toLowerCase())) return false
      if (targetFactionFilter && !(r.target.faction?.name || "").toLowerCase().includes(targetFactionFilter.toLowerCase())) return false
      return true
    })

    if (sortField && sortDirection) {
      list.sort((a, b) => {
        let aVal = 0, bVal = 0
        if (sortField === "skill") { aVal = a.reviver.skill ?? 0; bVal = b.reviver.skill ?? 0 }
        else if (sortField === "chance") { aVal = a.success_chance; bVal = b.success_chance }
        else { aVal = a.timestamp; bVal = b.timestamp }
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal
      })
    } else {
      list.sort((a, b) => b.timestamp - a.timestamp)
    }

    return list
  }, [
    revives,
    userId,
    filterType,
    dateFilter,
    categoryFilter,
    successPercentFilter,
    reviverNameFilter,
    targetNameFilter,
    reviverFactionFilter,
    targetFactionFilter,
    outcomeFilter,
    sortField,
    sortDirection,
  ])

  // Unique values
  const uniqueValues = useMemo(() => {
    if (!revives) return { revivers: [], reviverFactions: [], targets: [], targetFactions: [] }
    const revivers = new Set<string>()
    const reviverFactions = new Set<string>()
    const targets = new Set<string>()
    const targetFactions = new Set<string>()

    revives.revives.forEach(r => {
      revivers.add(r.reviver.name || `[${r.reviver.id}]`)
      if (r.reviver.faction?.name) reviverFactions.add(r.reviver.faction.name)
      targets.add(r.target.name || `[${r.target.id}]`)
      if (r.target.faction?.name) targetFactions.add(r.target.faction.name)
    })

    return {
      revivers: Array.from(revivers).sort((a, b) => a.localeCompare(b)),
      reviverFactions: Array.from(reviverFactions).sort((a, b) => a.localeCompare(b)),
      targets: Array.from(targets).sort((a, b) => a.localeCompare(b)),
      targetFactions: Array.from(targetFactions).sort((a, b) => a.localeCompare(b)),
    }
  }, [revives])

  // Skill gains
  const skillGains = useMemo(() => {
    const map = new Map<number, number>()
    const mine = getFilteredRevives
      .filter(r => r.reviver.id === userId && r.reviver.skill != null)
      .sort((a, b) => a.timestamp - b.timestamp)

    for (let i = 1; i < mine.length; i++) {
      const gain = mine[i].reviver.skill! - mine[i - 1].reviver.skill!
      if (gain > 0) map.set(mine[i].id, gain)
    }
    return map
  }, [getFilteredRevives, userId])

  const totalPages = Math.ceil(getFilteredRevives.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedRevives = getFilteredRevives.slice(startIndex, endIndex)

  const exportToExcel = () => {
    if (!getFilteredRevives.length) return
    const rows = getFilteredRevives.map(r => ({
      Reviver: r.reviver.name || `[${r.reviver.id}]`,
      "Reviver Faction": r.reviver.faction?.name || "N/A",
      Skill: r.reviver.skill ?? "N/A",
      Target: r.target.name || `[${r.target.id}]`,
      "Target Faction": r.target.faction?.name || "N/A",
      "Hospitalized By": r.target.hospital_reason,
      Category: r.Category || "N/A",
      "Success %": `${r.success_chance}%`,
      Outcome: r.result === "success" ? "Success" : "Failure",
      Timestamp: new Date(r.timestamp * 1000).toLocaleString(),
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Revives")
    XLSX.writeFile(wb, `torn-revives-${new Date().toISOString().split("T")[0]}.xlsx`)
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

  return (
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
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                exportToExcel()
              }}
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm hover:bg-accent h-8 px-3 cursor-pointer ${
                !getFilteredRevives.length ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <Download className="h-4 w-4" />
              Export
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onRefresh()
              }}
              className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
            </div>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4 space-y-3">
        {(initialRevivesLoading || !revives) ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <>
            <ReviveTableFilters
              filterType={filterType}
              dateFilter={dateFilter}
              categoryFilter={categoryFilter}
              itemsPerPage={itemsPerPage}
              showFullRevives={showFullRevives}
              loadingRevivesList={false}
              onFilterTypeChange={setFilterType}
              onDateFilterChange={setDateFilter}
              onCategoryChange={setCategoryFilter}
              onItemsPerPageChange={v => setItemsPerPage(Number(v))}
              onFullToggle={onFullToggle}
            />

            <ReviveTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              startIndex={startIndex}
              endIndex={endIndex}
              totalFiltered={getFilteredRevives.length}
              isLoadingMore={isLoadingMore}
              onPageChange={setCurrentPage}
            />

            {/* RESPONSIVE HORIZONTAL SCROLL WRAPPER */}
            <div className="overflow-x-auto -mx-4 px-4 sm:-mx-0 sm:px-0">
              <div className="inline-block min-w-full align-middle">
                <Card className="border-0">
                  <ScrollArea className="h-[600px] rounded-md">
                    <CardContent className="p-0">
                      {/* Sticky Header */}
                      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                        <ReviveTableHeader
                          showFullRevives={showFullRevives}
                          sortField={sortField}
                          sortDirection={sortDirection}
                          filters={{
                            reviverName: reviverNameFilter,
                            targetName: targetNameFilter,
                            reviverFaction: reviverFactionFilter,
                            targetFaction: targetFactionFilter,
                            successPercent: successPercentFilter,
                            outcome: outcomeFilter,
                          }}
                          uniqueValues={uniqueValues}
                          onSort={handleSort}
                          onFilterChange={(key, value) => {
                            switch (key) {
                              case "reviverName": setReviverNameFilter(value); break
                              case "targetName": setTargetNameFilter(value); break
                              case "reviverFaction": setReviverFactionFilter(value); break
                              case "targetFaction": setTargetFactionFilter(value); break
                              case "successPercent": setSuccessPercentFilter(value); break
                              case "outcome": setOutcomeFilter(value); break
                            }
                          }}
                        />
                      </div>

                      {paginatedRevives.length > 0 ? (
                        <div>
                          {paginatedRevives.map(r => (
                            <ReviveTableRow
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
                          <p className="text-muted-foreground">No revives found</p>
                        </div>
                      )}
                    </CardContent>
                  </ScrollArea>
                </Card>
              </div>

              {/* Mobile Scroll Hint */}
              <div className="flex justify-center mt-2 sm:hidden">
                <div className="flex items-center gap-1 text-xs text-muted-foreground animate-pulse">
                  <span>Scroll horizontally</span>
                  <span>→</span>
                </div>
              </div>
            </div>
          </>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}