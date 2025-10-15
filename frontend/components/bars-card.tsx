"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchBars } from "../lib/api"

interface Bar {
  current: number
  maximum: number
  increment: number
  interval: number
  tick_time: number
  full_time: number
}

interface Bars {
  energy: Bar
  nerve: Bar
  happy: Bar
  life: Bar
  chain: Bar | null
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`
  }
  return `${secs}s`
}

function BarItem({ name, bar, color }: { name: string; bar: Bar; color: string }) {
  const percentage = (bar.current / bar.maximum) * 100

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground capitalize">{name}</span>
        <span className="text-xs text-muted-foreground">
          {bar.current} / {bar.maximum}
        </span>
      </div>
      <Progress value={percentage} className="h-2" style={{ "--progress-color": color } as any} />
      {bar.full_time > 0 && <div className="text-xs text-muted-foreground">Full in {formatTime(bar.full_time)}</div>}
    </div>
  )
}

export function BarsCard() {
  const [bars, setBars] = useState<Bars | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    fetchBars()
      .then((data) => {
        setBars(data.bars)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch bars:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading bars...</div>
        </CardContent>
      </Card>
    )
  }

  if (!bars) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-destructive">Failed to load bars</div>
        </CardContent>
      </Card>
    )
  }

  if (isCollapsed) {
    return (
      <Card className="relative">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Bars</CardTitle>
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
          <CardTitle>Bars</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCollapsed(true)}>
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <BarItem name="energy" bar={bars.energy} color="oklch(0.70 0.15 140)" />
        <BarItem name="nerve" bar={bars.nerve} color="oklch(0.55 0.22 25)" />
        <BarItem name="happy" bar={bars.happy} color="oklch(0.75 0.18 60)" />
        <BarItem name="life" bar={bars.life} color="oklch(0.65 0.19 265)" />
      </CardContent>
    </Card>
  )
}
