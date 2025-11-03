import { Spinner } from "@/components/ui/spinner"
import { ReviveStatistics } from "@/components/revive-statistics"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { RefreshCw } from "lucide-react"

interface Props {
  loading: boolean
  revives: any[]
  userId: number
  correlationData: any
  reviveStats: any
  onRefresh: () => void
}

export function ReviveStatsSection({ loading, revives, userId, correlationData, reviveStats, onRefresh }: Props) {
  return (
    <AccordionItem value="statistics" className="border rounded-lg">
      <div className="flex items-center justify-between px-4 py-2 border-b">
        <span className="text-lg font-semibold">Statistics</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRefresh()
          }}
          className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors ${loading ? "pointer-events-none opacity-50" : ""}`}
          aria-label="Refresh statistics"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <AccordionTrigger className="px-4 hover:no-underline">
        <span className="sr-only">Toggle statistics</span>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-6 w-6" />
          </div>
        ) : revives ? (
          <ReviveStatistics
            revives={revives}
            userId={userId}
            correlationData={correlationData}
            reviveStats={reviveStats}
          />
        ) : null}
      </AccordionContent>
    </AccordionItem>
  )
}