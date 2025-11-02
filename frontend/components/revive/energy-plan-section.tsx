"use client"

import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { RefreshCw } from "lucide-react"

interface Props {
  loading: boolean
  barsData: any
  onRefresh: () => void
}

export function EnergyPlanSection({ loading, barsData, onRefresh }: Props) {
  return (
    <AccordionItem value="energy" className="border rounded-lg">
      <AccordionTrigger className="px-4 hover:no-underline">
        <div className="flex items-center justify-between w-full pr-4">
          <span className="text-lg font-semibold">Plan</span>
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
        ) : (
          <Card>
            <ScrollArea className="h-[400px]">
              <CardContent className="p-4">
                {/* Your energy plan content here */}
                <pre className="text-xs">{JSON.stringify(barsData, null, 2)}</pre>
              </CardContent>
            </ScrollArea>
          </Card>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}