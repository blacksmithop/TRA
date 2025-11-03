"use client"

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCw } from "lucide-react"
import { EnergyBarDisplay } from "@/components/energy-bar-display"
import type { UserBarsResponse } from "@/lib/types"

interface Props {
  loading: boolean
  barsData: UserBarsResponse | null
  onRefresh: () => void
}

export function EnergyPlanSection({ loading, barsData, onRefresh }: Props) {
  return (
    <AccordionItem value="energy" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <span className="text-lg font-semibold">Cost/Revive</span>
          <div
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onRefresh()
            }}
            className={`h-8 w-8 flex items-center justify-center rounded-md hover:bg-accent transition-colors cursor-pointer ${
              loading ? "pointer-events-none opacity-50" : ""
            }`}
          >
            <RefreshCw className="h-4 w-4" />
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : barsData?.bars.energy ? (
          <Card className="border-0">
            {/* REMOVED fixed height → fits content */}
            <ScrollArea className="max-h-[520px] rounded-md">
              <div className="p-4">
                <EnergyBarDisplay energyBar={barsData.bars.energy} />
              </div>
            </ScrollArea>
          </Card>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">No energy data available</p>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}