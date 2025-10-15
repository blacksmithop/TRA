import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

  // Calculate skill progression
  const skillData = revivesGiven.filter((r) => r.reviver.skill !== null).sort((a, b) => a.timestamp - b.timestamp)

  const startSkill = skillData.length > 0 ? skillData[0].reviver.skill : 0
  const endSkill = reviveSkillStat?.value ?? (skillData.length > 0 ? skillData[skillData.length - 1].reviver.skill : 0)
  const skillGained = endSkill! - startSkill!

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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{successRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {successfulGiven} / {fetchedCount} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fail Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{failRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {failedGiven} / {fetchedCount} failed
            </p>
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Success Chance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessChance.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Across all revives given</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Skill</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{endSkill?.toFixed(2) || "N/A"}</div>
            <p className="text-xs text-muted-foreground">Latest recorded skill level</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Streak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {currentStreak === 0
                ? "No current streak"
                : currentStreak === 1
                  ? "Current successful revive"
                  : "Consecutive successful revives"}
            </p>
          </CardContent>
        </Card>

        {correlationData && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Skill-Success Correlation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{correlationData.correlation.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                p-value: {correlationData.p_value.toFixed(4)}
                {correlationData.p_value > 0.05 && " (not statistically significant)"}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.abs(correlationData.correlation) < 0.3
                  ? "Weak correlation between skill and success rate"
                  : Math.abs(correlationData.correlation) < 0.7
                    ? "Moderate correlation between skill and success rate"
                    : "Strong correlation between skill and success rate"}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
