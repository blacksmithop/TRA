"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import type { Revive } from "@/lib/types"

interface ReviveSkillChartProps {
  revives: Revive[]
  userId: number
}

export function ReviveSkillChart({ revives, userId }: ReviveSkillChartProps) {
  // Filter and sort revives by user
  const userRevives = revives
    .filter((r) => r.reviver.id === userId && r.reviver.skill !== null)
    .sort((a, b) => a.timestamp - b.timestamp)

  // Prepare chart data
  const chartData = userRevives.map((revive) => ({
    timestamp: new Date(revive.timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    skill: revive.reviver.skill,
  }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revive Skill Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No skill data available
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revive Skill Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            skill: {
              label: "Skill Level",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="skill" stroke="var(--color-skill)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
