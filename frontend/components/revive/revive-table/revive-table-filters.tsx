import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

type CategoryFilter = "All" | "PvP" | "OD" | "Crime"

interface Props {
  filterType: "all" | "given" | "received"
  dateFilter: "all" | "7days" | "30days" | "90days"
  categoryFilter: CategoryFilter
  itemsPerPage: number
  showFullRevives: boolean
  loadingRevivesList: boolean
  onFilterTypeChange: (v: "all" | "given" | "received") => void
  onDateFilterChange: (v: "all" | "7days" | "30days" | "90days") => void
  onCategoryChange: (v: CategoryFilter) => void
  onItemsPerPageChange: (v: string) => void
  onFullToggle: (checked: boolean) => void
}

const categories: CategoryFilter[] = ["All", "PvP", "OD", "Crime"]

export function ReviveTableFilters({
  filterType,
  dateFilter,
  categoryFilter,
  itemsPerPage,
  showFullRevives,
  loadingRevivesList,
  onFilterTypeChange,
  onDateFilterChange,
  onCategoryChange,
  onItemsPerPageChange,
  onFullToggle,
}: Props) {
  return (
    <>
      <div className="flex items-center gap-3 pb-2 border-b">
        <Switch
          id="full-revives"
          checked={showFullRevives}
          onCheckedChange={onFullToggle}
          disabled={loadingRevivesList}
        />
        <Label htmlFor="full-revives" className="text-sm font-medium cursor-pointer">
          Full
          <span className="text-xs text-muted-foreground ml-2">
            (Shows all revives with IDs instead of names)
          </span>
        </Label>
      </div>

      <div className="flex items-end gap-2 flex-wrap">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Filter by Type</Label>
          <Select value={filterType} onValueChange={onFilterTypeChange}>
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
          <Select value={dateFilter} onValueChange={onDateFilterChange}>
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
          <Label className="text-sm font-medium">Filter by Category</Label>
          <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Items per Page</Label>
          <Select value={itemsPerPage.toString()} onValueChange={onItemsPerPageChange}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="15">15</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )
}