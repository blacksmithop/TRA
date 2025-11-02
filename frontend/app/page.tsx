"use client"

import { useReviveData } from "@/hooks/use-revive-data"
import { EnergyPlanSection } from "@/components/revive/energy-plan-section"
import { ReviveStatsSection } from "@/components/revive/revive-stats-section"
import { ReviveGraphSection } from "@/components/revive/revive-graph-section"
import { ReviveTable } from "@/components/revive/revive-table/revive-table"
import { Accordion } from "@/components/ui/accordion"
import { AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { removeApiKey } from "@/lib/storage"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  const {
    userId,
    revives,
    correlationData,
    reviveStats,
    barsData,
    loading,
    hasAccessError,
    loadingStats,
    loadingGraph,
    loadingEnergy,
    isLoadingMore,
    totalRevivesLoaded,
    initialRevivesLoading,
    showFullRevives,
    reloadStatsAndGraph,
    reloadEnergy,
    reloadRevivesList,
    handleFullRevivesToggle,
  } = useReviveData()

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center">Loading...</div>
  }

  if (hasAccessError) {
    return (
      <div className="flex min-h-[600px] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold">API Access Level Not Sufficient</h2>
            <p className="text-sm text-muted-foreground">
              Your API key does not have the required access level.
            </p>
            <Button
              onClick={() => {
                removeApiKey()
                router.push("/login")
              }}
              variant="outline"
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
        <EnergyPlanSection loading={loadingEnergy} barsData={barsData} onRefresh={reloadEnergy} />
        <ReviveStatsSection
          loading={loadingStats}
          revives={revives?.revives || []}
          userId={userId!}
          correlationData={correlationData}
          reviveStats={reviveStats}
          onRefresh={reloadStatsAndGraph}
        />
        <ReviveGraphSection
          loading={loadingGraph}
          revives={revives?.revives || []}
          userId={userId!}
          onRefresh={reloadStatsAndGraph}
        />
        <ReviveTable
          userId={userId!}
          revives={revives}
          showFullRevives={showFullRevives}
          isLoadingMore={isLoadingMore}
          totalRevivesLoaded={totalRevivesLoaded}
          initialRevivesLoading={initialRevivesLoading}
          onFullToggle={handleFullRevivesToggle}
          onRefresh={reloadRevivesList}
        />
      </Accordion>
    </div>
  )
}