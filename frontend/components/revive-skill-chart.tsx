"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Revive } from "@/lib/types"

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false })

interface ReviveSkillChartProps {
  revives: Revive[]
  userId: number
}

type TimePeriod = "24h" | "7d" | "30d" | "90d" | "all"

export function ReviveSkillChart({ revives, userId }: ReviveSkillChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("all")

  // Filter and sort revives by user
  const userRevives = useMemo(
    () =>
      revives
        .filter((r) => r.reviver.id === userId && r.reviver.skill !== null)
        .sort((a, b) => a.timestamp - b.timestamp),
    [revives, userId],
  )

  const availablePeriods = useMemo(() => {
    if (userRevives.length === 0) return []

    const now = Date.now() / 1000
    const oldestTimestamp = userRevives[0].timestamp
    const dataRangeSeconds = now - oldestTimestamp

    const periods: TimePeriod[] = []
    if (dataRangeSeconds >= 86400) periods.push("24h") // 1 day
    if (dataRangeSeconds >= 604800) periods.push("7d") // 7 days
    if (dataRangeSeconds >= 2592000) periods.push("30d") // 30 days
    if (dataRangeSeconds >= 7776000) periods.push("90d") // 90 days
    periods.push("all")

    return periods
  }, [userRevives])

  const filteredRevives = useMemo(() => {
    if (selectedPeriod === "all") return userRevives

    const now = Date.now() / 1000
    const cutoffTimes: Record<Exclude<TimePeriod, "all">, number> = {
      "24h": now - 86400,
      "7d": now - 604800,
      "30d": now - 2592000,
      "90d": now - 7776000,
    }

    const cutoff = cutoffTimes[selectedPeriod as Exclude<TimePeriod, "all">]
    return userRevives.filter((r) => r.timestamp >= cutoff)
  }, [userRevives, selectedPeriod])

  const plotData = useMemo(() => {
    return {
      x: filteredRevives.map((r) => new Date(r.timestamp * 1000)),
      y: filteredRevives.map((r) => r.reviver.skill),
      // Store additional data for click events
      customdata: filteredRevives.map((r) => ({
        target: r.target.name,
        targetId: r.target.id,
        result: r.result,
        timestamp: r.timestamp,
      })),
      type: "scatter" as const,
      mode: "lines+markers" as const,
      name: "Revive Skill",
      line: {
        color: "rgba(255, 255, 255, 0.8)", // Changed line color to white for visibility on dark background
        width: 2,
      },
      marker: {
        size: 6,
        color: "rgba(255, 255, 255, 0.9)", // Changed marker color to white for visibility on dark background
      },
      hovertemplate:
        "<b>Skill:</b> %{y:.2f}<br>" +
        "<b>Date:</b> %{x|%b %d, %Y %I:%M %p}<br>" +
        "<b>Target:</b> %{customdata.target}<br>" +
        "<b>Result:</b> %{customdata.result}<br>" +
        "<extra></extra>",
    }
  }, [filteredRevives])

  const periodLabels: Record<TimePeriod, string> = {
    "24h": "24 Hours",
    "7d": "7 Days",
    "30d": "30 Days",
    "90d": "90 Days",
    all: "All Time",
  }

  if (userRevives.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-sm">Revive Skill Progress</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-3">
          <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
            No skill data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-1 pt-3 px-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm">Revive Skill Progress</CardTitle>
          <div className="flex gap-1">
            {availablePeriods.map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  selectedPeriod === period
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {periodLabels[period]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="h-[300px]">
          <Plot
            data={[plotData]}
            layout={{
              autosize: true,
              margin: { l: 50, r: 20, t: 20, b: 50 },
              xaxis: {
                title: "",
                gridcolor: "rgba(128, 128, 128, 0.2)",
                showgrid: true,
                tickfont: {
                  color: "rgba(255, 255, 255, 0.85)",
                  size: 11,
                },
              },
              yaxis: {
                title: "Skill Level",
                gridcolor: "rgba(128, 128, 128, 0.2)",
                showgrid: true,
                tickfont: {
                  color: "rgba(255, 255, 255, 0.85)",
                  size: 11,
                },
                titlefont: {
                  color: "rgba(255, 255, 255, 0.85)",
                  size: 12,
                },
              },
              plot_bgcolor: "transparent",
              paper_bgcolor: "transparent",
              font: {
                color: "rgba(255, 255, 255, 0.85)",
                size: 12,
              },
              hovermode: "closest",
              dragmode: "zoom",
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              modeBarButtonsToRemove: ["lasso2d", "select2d"],
              displaylogo: false,
              toImageButtonOptions: {
                format: "png",
                filename: "revive_skill_progress",
                height: 600,
                width: 1200,
              },
            }}
            style={{ width: "100%", height: "100%" }}
            onClick={(data) => {
              if (data.points && data.points.length > 0) {
                const point = data.points[0]
                const customData = point.customdata as any
                console.log("[v0] Clicked revive:", {
                  skill: point.y,
                  target: customData.target,
                  targetId: customData.targetId,
                  result: customData.result,
                  timestamp: customData.timestamp,
                })
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
