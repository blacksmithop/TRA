// components/revive/revive-graph-section.tsx
import { Spinner } from "@/components/ui/spinner"
import { ReviveSkillChart } from "@/components/revive-skill-chart"
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { RefreshCw } from "lucide-react"

interface Props {
  loading: boolean
  revives: any[]
  userId: number
  onRefresh: () => void
}

export function ReviveGraphSection({ loading, revives, userId, onRefresh }: Props) {
  return (
    <AccordionItem value="graph" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <span className="text-lg font-semibold">Revive Skill Progress</span>
          <button
            onClick={(e) => { e.stopPropagation(); onRefresh() }}
            className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors ${loading ? "pointer-events-none opacity-50" : ""}`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Spinner className="h-6 w-6" /></div>
        ) : revives ? (
          <ReviveSkillChart revives={revives} userId={userId} />
        ) : null}
      </AccordionContent>
    </AccordionItem>
  )
}