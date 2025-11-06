import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import type { Revive, ReviveStats } from "@/lib/types"

interface ReviveStatisticsProps {
  revives: Revive[]
  userId: number
  correlationData?: {
    correlation: number
    p_value: number
  } | null
  reviveStats?: ReviveStats | null
}

const COLORS = {
  success: '#10b981',
  failure: '#ef4444',
  pvp: '#3b82f6',
  od: '#8b5cf6', 
  crime: '#f97316',
  other: '#6b7280'
}

export function ReviveStatistics({ revives, userId, correlationData, reviveStats }: ReviveStatisticsProps) {
  const reviveSkillStat = reviveStats?.personalstats.find((s) => s.name === "reviveskill")
  const totalRevivesStat = reviveStats?.personalstats.find((s) => s.name === "revives")
  const revivesReceivedStat = reviveStats?.personalstats.find((s) => s.name === "revivesreceived")

  const revivesGiven = revives.filter((r) => r.reviver.id === userId)
  const revivesReceived = revives.filter((r) => r.target.id === userId)

  // Use API stats for true totals
  const totalGiven = totalRevivesStat?.value ?? revivesGiven.length
  const totalReceived = revivesReceivedStat?.value ?? revivesReceived.length

  // Calculate success/fail from fetched revives only (not total)
  const fetchedCount = revivesGiven.length
  const successfulGiven = revivesGiven.filter((r) => r.result === "success").length
  const failedGiven = revivesGiven.filter((r) => r.result === "failure").length

  const successRate = fetchedCount > 0 ? (successfulGiven / fetchedCount) * 100 : 0
  const failRate = fetchedCount > 0 ? (failedGiven / fetchedCount) * 100 : 0

  // Calculate skill progression with time tracking
  const skillData = revivesGiven
    .filter((r) => r.reviver.skill !== null)
    .sort((a, b) => a.timestamp - b.timestamp)

  const startSkill = skillData.length > 0 ? skillData[0].reviver.skill : 0
  const endSkill = reviveSkillStat?.value ?? (skillData.length > 0 ? skillData[skillData.length - 1].reviver.skill : 0)
  const skillGained = endSkill! - startSkill!

  // Calculate time taken for skill progression
  let timeTo100 = null
  if (skillData.length > 0) {
    // Find the first revive where skill reached 100 (or closest to 100)
    const skill100Revive = skillData.find(r => r.reviver.skill && r.reviver.skill >= 100)
    if (skill100Revive) {
      const startTime = skillData[0].timestamp
      const endTime = skill100Revive.timestamp
      timeTo100 = endTime - startTime
    }
  }

  const formatTimeDuration = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const avgSuccessChance =
    fetchedCount > 0 ? revivesGiven.reduce((sum, r) => sum + r.success_chance, 0) / fetchedCount : 0

  const sortedRevives = [...revivesGiven].sort((a, b) => b.timestamp - a.timestamp)
  let currentStreak = 0
  for (const revive of sortedRevives) {
    if (revive.result === "success") {
      currentStreak++
    } else {
      break
    }
  }

  // Category breakdown data for pie chart
  const categoryData = [
    { name: 'PvP', value: revivesGiven.filter(r => r.Category === 'PvP').length, color: COLORS.pvp },
    { name: 'OD', value: revivesGiven.filter(r => r.Category === 'OD').length, color: COLORS.od },
    { name: 'Crime', value: revivesGiven.filter(r => r.Category === 'Crime').length, color: COLORS.crime },
    { name: 'Other', value: revivesGiven.filter(r => !r.Category || !['PvP', 'OD', 'Crime'].includes(r.Category)).length, color: COLORS.other },
  ].filter(item => item.value > 0)

  // Success/Failure data for pie chart
  const outcomeData = [
    { name: 'Success', value: successfulGiven, color: COLORS.success },
    { name: 'Failure', value: failedGiven, color: COLORS.failure },
  ].filter(item => item.value > 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border p-2 rounded shadow-sm">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-sm">{payload[0].value} revives ({((payload[0].value / fetchedCount) * 100).toFixed(1)}%)</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-4">
      {/* Top Row: Total Revives, Skill, and Correlation */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revives Given</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGiven}</div>
            <p className="text-xs text-muted-foreground">Received: {totalReceived}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Skill Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{skillGained.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {startSkill?.toFixed(2)} → {endSkill?.toFixed(2)}
            </p>
            {timeTo100 && (
              <p className="text-xs text-muted-foreground mt-1">
                Time to 100: {formatTimeDuration(timeTo100)}
              </p>
            )}
            {!timeTo100 && endSkill && endSkill < 100 && (
              <p className="text-xs text-muted-foreground mt-1">
                {((endSkill / 100) * 100).toFixed(1)}% to 100 skill
              </p>
            )}
            {endSkill && endSkill >= 100 && (
              <p className="text-xs text-green-500 font-medium mt-1">
                ✓ Reached 100 skill
              </p>
            )}
          </CardContent>
        </Card>

        {correlationData ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skill-Success Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{correlationData.correlation.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                p-value: {correlationData.p_value.toFixed(4)}
                {correlationData.p_value > 0.05 && " (not significant)"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {Math.abs(correlationData.correlation) < 0.3
                  ? "Weak correlation"
                  : Math.abs(correlationData.correlation) < 0.7
                    ? "Moderate correlation"
                    : "Strong correlation"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Success Chance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgSuccessChance.toFixed(2)}%</div>
              <p className="text-xs text-muted-foreground">Across all revives given</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Pie Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Revives by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              Total: {fetchedCount} revives
            </div>
          </CardContent>
        </Card>

        {/* Success/Failure Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {outcomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center space-y-1">
              <div className="text-lg font-bold text-green-500">{successRate.toFixed(1)}% Success Rate</div>
              <div className="text-sm text-muted-foreground">
                Average Success Chance: {avgSuccessChance.toFixed(2)}%
              </div>
              <div className="text-sm text-blue-500 font-medium">
                Current Streak: {currentStreak} {currentStreak === 1 ? 'revive' : 'revives'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}