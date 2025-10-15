"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Modifier {
  effect: string
  value: number
  type: string
}

interface Stat {
  value: number
  modifier: number
  modifiers: Modifier[]
}

interface BattleStats {
  strength: Stat
  defense: Stat
  speed: Stat
  dexterity: Stat
  total: number
}

function StatItem({ name, stat }: { name: string; stat: Stat }) {
  const baseValue = stat.value
  const effectiveValue = Math.round(stat.value * (1 + stat.modifier / 100))

  return (
    <div className="flex items-baseline gap-3">
      <div className="text-sm font-medium text-muted-foreground capitalize min-w-[80px]">{name}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold text-muted-foreground">{baseValue.toLocaleString()}</span>
        <span className="text-muted-foreground">→</span>
        <span className="text-2xl font-bold text-foreground">{effectiveValue.toLocaleString()}</span>
      </div>
      {stat.modifier !== 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={`cursor-help rounded px-1.5 py-0.5 text-xs font-medium ${stat.modifier > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}
              >
                {stat.modifier > 0 ? "+" : ""}
                {stat.modifier}%
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <div className="space-y-1">
                <div className="font-medium text-xs mb-2">Modifiers:</div>
                {stat.modifiers.map((mod, idx) => (
                  <div key={idx} className={`text-xs ${mod.value > 0 ? "text-green-400" : "text-red-400"}`}>
                    {mod.effect}
                  </div>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function BattleStatsCard() {
  const [stats, setStats] = useState<BattleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    fetch("http://localhost:8000/torn/battlestats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.battlestats)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch battle stats:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading battle stats...</div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-destructive">Failed to load battle stats</div>
        </CardContent>
      </Card>
    )
  }

  const totalBase = stats.strength.value + stats.defense.value + stats.speed.value + stats.dexterity.value

  const totalEffective = Math.round(
    stats.strength.value * (1 + stats.strength.modifier / 100) +
      stats.defense.value * (1 + stats.defense.modifier / 100) +
      stats.speed.value * (1 + stats.speed.modifier / 100) +
      stats.dexterity.value * (1 + stats.dexterity.modifier / 100),
  )

  if (isCollapsed) {
    return (
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Battle Stats</CardTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsCollapsed(false)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between flex-1 mr-2">
            <CardTitle>Battle Stats</CardTitle>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Total</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-semibold text-muted-foreground">{totalBase.toLocaleString()}</span>
                <span className="text-muted-foreground">→</span>
                <span className="text-2xl font-bold text-primary">{totalEffective.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCollapsed(true)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <StatItem name="strength" stat={stats.strength} />
          <StatItem name="defense" stat={stats.defense} />
          <StatItem name="speed" stat={stats.speed} />
          <StatItem name="dexterity" stat={stats.dexterity} />
        </div>
      </CardContent>
    </Card>
  )
}
