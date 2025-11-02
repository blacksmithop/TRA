// components/revive/revive-table/revive-table-header.tsx
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, Filter, X, Search } from "lucide-react"
import { useRef, useState, useEffect } from "react"

type SortField = "skill" | "chance" | "timestamp" | null
type SortDirection = "asc" | "desc" | null

interface FilterState {
  reviverName: string
  targetName: string
  reviverFaction: string
  targetFaction: string
  successPercent: "All" | "Low" | "Medium" | "High" | "Very High"
  outcome: "all" | "success" | "failure"
}

interface Props {
  showFullRevives: boolean
  sortField: SortField
  sortDirection: SortDirection
  filters: FilterState
  uniqueValues: {
    revivers: string[]
    reviverFactions: string[]
    targets: string[]
    targetFactions: string[]
  }
  onSort: (field: "skill" | "chance" | "timestamp") => void
  onFilterChange: (key: keyof FilterState, value: any) => void
}

const successPercents: FilterState["successPercent"][] = ["All", "Low", "Medium", "High", "Very High"]

export function ReviveTableHeader({
  showFullRevives,
  sortField,
  sortDirection,
  filters,
  uniqueValues,
  onSort,
  onFilterChange,
}: Props) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({})
  const dropdownRef = useRef<HTMLDivElement>(null)

  const inputRefs = {
    reviverName: useRef<HTMLInputElement>(null),
    reviverFaction: useRef<HTMLInputElement>(null),
    targetName: useRef<HTMLInputElement>(null),
    targetFaction: useRef<HTMLInputElement>(null),
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveFilter(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleFilterClick = (column: string, ref?: React.RefObject<HTMLInputElement>) => {
    setActiveFilter(activeFilter === column ? null : column)
    setTimeout(() => ref?.current?.focus(), 10)
  }

  const getFilteredOptions = (options: string[], query: string) => {
    if (!query) return options.slice(0, 5)
    return options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
  }

  const hasActiveFilter = (key: keyof FilterState) => {
    const val = filters[key]
    return val !== "All" && val !== "all" && val !== ""
  }

  const SortIcon = ({ field }: { field: "skill" | "chance" | "timestamp" }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    return sortDirection === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const getSuccessColor = (val: string) => {
    switch (val) {
      case "Low": return "text-red-500"
      case "Medium": return "text-yellow-500"
      case "High": return "text-emerald-500"
      case "Very High": return "text-green-500"
      default: return ""
    }
  }

  const gridClass = showFullRevives
    ? "grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.2fr_0.8fr_1fr_0.8fr_1fr_1.2fr] gap-3 px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10"
    : "grid grid-cols-[1.2fr_1.2fr_0.6fr_1.2fr_1.2fr_1.2fr_1fr_0.8fr_1.2fr] gap-3 px-2 sm:px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground bg-muted/50 border-b border-border sticky top-0 z-10"

  return (
    <div className={gridClass}>
      {/* Reviver */}
      <div className="relative flex items-center gap-1">
        <span>Reviver</span>
        <button onClick={(e) => { e.stopPropagation(); handleFilterClick("reviverName", inputRefs.reviverName) }} className={`h-4 w-4 flex items-center justify-center rounded-sm transition-colors ${hasActiveFilter("reviverName") ? "text-blue-500" : "opacity-50 hover:opacity-100"}`}>
          <Filter className="h-3 w-3" />
        </button>
        <SortIcon field="skill" />
        {activeFilter === "reviverName" && (
          <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Filter Reviver</span>
              <button onClick={() => setActiveFilter(null)}><X className="h-3 w-3" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                ref={inputRefs.reviverName}
                type="text"
                placeholder="Search..."
                value={searchQueries.reviverName || ""}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, reviverName: e.target.value }))}
                className="w-full pl-7 pr-2 py-1 text-sm border rounded bg-background"
              />
            </div>
            <div className="max-h-40 overflow-y-auto mt-2">
              {getFilteredOptions(uniqueValues.revivers, searchQueries.reviverName || "").map(name => (
                <div
                  key={name}
                  className="p-1 hover:bg-accent rounded cursor-pointer text-sm"
                  onClick={() => {
                    onFilterChange("reviverName", name)
                    setActiveFilter(null)
                  }}
                >
                  {name}
                </div>
              ))}
            </div>
            {filters.reviverName && (
              <Button variant="outline" size="sm" onClick={() => onFilterChange("reviverName", "")} className="w-full mt-2 text-xs">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Reviver Faction */}
      <div className="relative flex items-center gap-1">
        <span>Faction</span>
        <button onClick={(e) => { e.stopPropagation(); handleFilterClick("reviverFaction", inputRefs.reviverFaction) }} className={`h-4 w-4 flex items-center justify-center rounded-sm transition-colors ${hasActiveFilter("reviverFaction") ? "text-blue-500" : "opacity-50 hover:opacity-100"}`}>
          <Filter className="h-3 w-3" />
        </button>
        {activeFilter === "reviverFaction" && (
          <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Filter Faction</span>
              <button onClick={() => setActiveFilter(null)}><X className="h-3 w-3" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                ref={inputRefs.reviverFaction}
                type="text"
                placeholder="Search..."
                value={searchQueries.reviverFaction || ""}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, reviverFaction: e.target.value }))}
                className="w-full pl-7 pr-2 py-1 text-sm border rounded bg-background"
              />
            </div>
            <div className="max-h-40 overflow-y-auto mt-2">
              {getFilteredOptions(uniqueValues.reviverFactions, searchQueries.reviverFaction || "").map(f => (
                <div key={f} className="p-1 hover:bg-accent rounded cursor-pointer text-sm" onClick={() => { onFilterChange("reviverFaction", f); setActiveFilter(null) }}>
                  {f}
                </div>
              ))}
            </div>
            {filters.reviverFaction && (
              <Button variant="outline" size="sm" onClick={() => onFilterChange("reviverFaction", "")} className="w-full mt-2 text-xs">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Skill */}
      <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => onSort("skill")}>
        Skill <SortIcon field="skill" />
      </div>

      {/* Target */}
      <div className="relative flex items-center gap-1">
        <span>Target</span>
        <button onClick={(e) => { e.stopPropagation(); handleFilterClick("targetName", inputRefs.targetName) }} className={`h-4 w-4 flex items-center justify-center rounded-sm transition-colors ${hasActiveFilter("targetName") ? "text-blue-500" : "opacity-50 hover:opacity-100"}`}>
          <Filter className="h-3 w-3" />
        </button>
        {activeFilter === "targetName" && (
          <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Filter Target</span>
              <button onClick={() => setActiveFilter(null)}><X className="h-3 w-3" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                ref={inputRefs.targetName}
                type="text"
                placeholder="Search..."
                value={searchQueries.targetName || ""}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, targetName: e.target.value }))}
                className="w-full pl-7 pr-2 py-1 text-sm border rounded bg-background"
              />
            </div>
            <div className="max-h-40 overflow-y-auto mt-2">
              {getFilteredOptions(uniqueValues.targets, searchQueries.targetName || "").map(t => (
                <div key={t} className="p-1 hover:bg-accent rounded cursor-pointer text-sm" onClick={() => { onFilterChange("targetName", t); setActiveFilter(null) }}>
                  {t}
                </div>
              ))}
            </div>
            {filters.targetName && (
              <Button variant="outline" size="sm" onClick={() => onFilterChange("targetName", "")} className="w-full mt-2 text-xs">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Target Faction */}
      <div className="relative flex items-center gap-1">
        <span>Faction</span>
        <button onClick={(e) => { e.stopPropagation(); handleFilterClick("targetFaction", inputRefs.targetFaction) }} className={`h-4 w-4 flex items-center justify-center rounded-sm transition-colors ${hasActiveFilter("targetFaction") ? "text-blue-500" : "opacity-50 hover:opacity-100"}`}>
          <Filter className="h-3 w-3" />
        </button>
        {activeFilter === "targetFaction" && (
          <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Filter Faction</span>
              <button onClick={() => setActiveFilter(null)}><X className="h-3 w-3" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <input
                ref={inputRefs.targetFaction}
                type="text"
                placeholder="Search..."
                value={searchQueries.targetFaction || ""}
                onChange={(e) => setSearchQueries(prev => ({ ...prev, targetFaction: e.target.value }))}
                className="w-full pl-7 pr-2 py-1 text-sm border rounded bg-background"
              />
            </div>
            <div className="max-h-40 overflow-y-auto mt-2">
              {getFilteredOptions(uniqueValues.targetFactions, searchQueries.targetFaction || "").map(f => (
                <div key={f} className="p-1 hover:bg-accent rounded cursor-pointer text-sm" onClick={() => { onFilterChange("targetFaction", f); setActiveFilter(null) }}>
                  {f}
                </div>
              ))}
            </div>
            {filters.targetFaction && (
              <Button variant="outline" size="sm" onClick={() => onFilterChange("targetFaction", "")} className="w-full mt-2 text-xs">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <div>Hospitalized by</div>
      {showFullRevives && <div>Category</div>}
      {showFullRevives && (
        <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => onSort("chance")}>
          Success % <SortIcon field="chance" />
        </div>
      )}

      {/* Success % */}
      <div className="relative flex items-center gap-1">
        <span>Success %</span>
        <button onClick={(e) => { e.stopPropagation(); handleFilterClick("successPercent") }} className={`h-4 w-4 flex items-center justify-center rounded-sm transition-colors ${hasActiveFilter("successPercent") ? "text-blue-500" : "opacity-50 hover:opacity-100"}`}>
          <Filter className="h-3 w-3" />
        </button>
        {activeFilter === "successPercent" && (
          <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Filter Success %</span>
              <button onClick={() => setActiveFilter(null)}><X className="h-3 w-3" /></button>
            </div>
            <select
              value={filters.successPercent}
              onChange={(e) => onFilterChange("successPercent", e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded bg-background mb-2"
            >
              {successPercents.map(p => (
                <option key={p} value={p} className={getSuccessColor(p)}>{p}</option>
              ))}
            </select>
            {filters.successPercent !== "All" && (
              <Button variant="outline" size="sm" onClick={() => onFilterChange("successPercent", "All")} className="w-full text-xs">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Outcome */}
      <div className="relative flex items-center gap-1">
        <span>Outcome</span>
        <button onClick={(e) => { e.stopPropagation(); handleFilterClick("outcome") }} className={`h-4 w-4 flex items-center justify-center rounded-sm transition-colors ${hasActiveFilter("outcome") ? "text-blue-500" : "opacity-50 hover:opacity-100"}`}>
          <Filter className="h-3 w-3" />
        </button>
        {activeFilter === "outcome" && (
          <div ref={dropdownRef} className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-20 p-3">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Filter Outcome</span>
              <button onClick={() => setActiveFilter(null)}><X className="h-3 w-3" /></button>
            </div>
            <select
              value={filters.outcome}
              onChange={(e) => onFilterChange("outcome", e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded bg-background mb-2"
            >
              <option value="all">All</option>
              <option value="success" className="text-green-500">Success</option>
              <option value="failure" className="text-red-500">Failure</option>
            </select>
            {filters.outcome !== "all" && (
              <Button variant="outline" size="sm" onClick={() => onFilterChange("outcome", "all")} className="w-full text-xs">
                Clear
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center cursor-pointer hover:text-foreground transition-colors" onClick={() => onSort("timestamp")}>
        Timestamp <SortIcon field="timestamp" />
      </div>
    </div>
  )
}