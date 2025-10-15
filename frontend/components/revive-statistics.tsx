import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Revive } from "@/lib/types"

interface ReviveStatisticsProps {
  revives: Revive[]
  userId: number
}

export function ReviveStatistics({ revives, userId }: ReviveStatisticsProps) {
  // Calculate statistics
  const revivesGiven = revives.filter((r) => r.reviver.id === userId)
  const revivesReceived = revives.filter((r) => r.target.id === userId)

  const totalGiven = revivesGiven.length
  const totalReceived = revivesReceived.length

  const successfulGiven = revivesGiven.filter((r) => r.result === "success").length
  const failedGiven = revivesGiven.filter((r) => r.result === "failure").length

  const successRate = totalGiven > 0 ? (successfulGiven / totalGiven) * 100 : 0
  const failRate = totalGiven > 0 ? (failedGiven / totalGiven) * 100 : 0

  // Calculate skill progression
  const skillData = revivesGiven.filter((r) => r.reviver.skill !== null).sort((a, b) => a.timestamp - b.timestamp)

  const startSkill = skillData.length > 0 ? skillData[0].reviver.skill : 0
  const endSkill = skillData.length > 0 ? skillData[skillData.length - 1].reviver.skill : 0
  const skillGained = endSkill! - startSkill!

  const avgSuccessChance = totalGiven > 0 ? revivesGiven.reduce((sum, r) => sum + r.success_chance, 0) / totalGiven : 0

  return (
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
            {successfulGiven} / {totalGiven} successful
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
            {failedGiven} / {totalGiven} failed
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

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Average Success Chance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgSuccessChance.toFixed(2)}%</div>
          <p className="text-xs text-muted-foreground">Across all revives given</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Current Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{endSkill?.toFixed(2) || "N/A"}</div>
          <p className="text-xs text-muted-foreground">Latest recorded skill level</p>
        </CardContent>
      </Card>
    </div>
  )
}
