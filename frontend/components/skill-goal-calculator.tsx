"use client"

import { useState, useEffect } from "react"
import { Target } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { fetchRevives, fetchReviveStats } from "@/lib/api"
import type { Revive, ReviveStats } from "@/lib/types"

interface SkillGoalResult {
  currentSkill: number
  targetSkill: number
  skillNeeded: number
  avgGainPer24h: number
  estimatedRevives: number
  estimatedDays: number
  revivesPer24h: number
  confidence: "low" | "medium" | "high"
  warning?: string
}

export function SkillGoalCalculator() {
  const [open, setOpen] = useState(false)
  const [targetSkill, setTargetSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SkillGoalResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSkill, setCurrentSkill] = useState<number>(0)

  useEffect(() => {
    const loadSkill = async () => {
      try {
        const stats: ReviveStats = await fetchReviveStats()
        const reviveSkillStat = stats.personalstats.find((stat) => stat.name === "reviveskill")
        if (reviveSkillStat) {
          setCurrentSkill(reviveSkillStat.value)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch revive skill:", err)
      }
    }

    loadSkill()
  }, [])

  const calculateSkillDegradation = (skill: number): number => {
    // Formula: 1 - 0.208 * ln(skill)
    // This represents how much the base gain is multiplied at different skill levels
    return Math.max(0.01, 1 - 0.208 * Math.log(skill))
  }

  const handleCalculate = async () => {
    const target = Number.parseFloat(targetSkill)

    if (!targetSkill.trim() || isNaN(target)) {
      setError("Please enter a valid target skill level")
      return
    }

    if (target <= currentSkill) {
      setError("Target skill must be higher than your current skill")
      return
    }

    if (target > 100) {
      setError("Target skill cannot exceed 100")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Fetch recent revive data (last 24 hours worth)
      const now = Math.floor(Date.now() / 1000)
      const oneDayAgo = now - 86400
      const revivesData = await fetchRevives(oneDayAgo)
      const revives: Revive[] = revivesData.revives || []

      // Filter revives where user was the reviver and has skill data
      const userRevives = revives.filter((r) => r.reviver.skill !== null).sort((a, b) => a.timestamp - b.timestamp)

      if (userRevives.length < 5) {
        setError("Not enough recent revive data. Please perform more revives to get an accurate estimate.")
        setLoading(false)
        return
      }

      // Calculate actual skill gains from recent data
      let totalGain = 0
      let gainCount = 0

      for (let i = 1; i < userRevives.length; i++) {
        const prevSkill = userRevives[i - 1].reviver.skill!
        const currSkill = userRevives[i].reviver.skill!
        const gain = currSkill - prevSkill

        if (gain > 0 && gain < 1) {
          // Valid gain (positive and reasonable)
          totalGain += gain
          gainCount++
        }
      }

      if (gainCount === 0) {
        setError("Unable to calculate skill gain from recent data. Try again after performing more revives.")
        setLoading(false)
        return
      }

      const avgGainPerRevive = totalGain / gainCount

      // Calculate revives per 24 hours
      const timeSpan = userRevives[userRevives.length - 1].timestamp - userRevives[0].timestamp
      const revivesPer24h = (userRevives.length / timeSpan) * 86400

      // Calculate average skill gain per 24 hours
      const avgGainPer24h = avgGainPerRevive * revivesPer24h

      // Calculate skill needed
      const skillNeeded = target - currentSkill

      // Estimate revives needed accounting for skill degradation
      // As skill increases, gains decrease, so we need to integrate over the skill range
      let estimatedRevives = 0
      let simulatedSkill = currentSkill
      const stepSize = 0.1 // Simulate in small steps

      while (simulatedSkill < target) {
        const degradationFactor = calculateSkillDegradation(simulatedSkill)
        const expectedGain = avgGainPerRevive * degradationFactor

        if (expectedGain <= 0) {
          // Prevent infinite loop
          estimatedRevives = Number.POSITIVE_INFINITY
          break
        }

        estimatedRevives += stepSize / expectedGain
        simulatedSkill += stepSize
      }

      // Calculate estimated days
      const estimatedDays = estimatedRevives / revivesPer24h

      // Determine confidence level
      let confidence: "low" | "medium" | "high" = "medium"
      let warning: string | undefined

      if (gainCount < 10) {
        confidence = "low"
        warning = "Low confidence: Limited data available. Estimate may be inaccurate."
      } else if (gainCount >= 20) {
        confidence = "high"
      }

      // Add warnings for high skill levels
      if (target >= 90) {
        warning =
          "At skill level 90+, gains are very small (0.01-0.02) regardless of hospital time. Progress will be slow."
      } else if (target >= 80) {
        warning = "Skill gains decrease significantly at higher levels. Actual progress may vary."
      }

      setResult({
        currentSkill,
        targetSkill: target,
        skillNeeded,
        avgGainPer24h,
        estimatedRevives: Math.ceil(estimatedRevives),
        estimatedDays: Math.ceil(estimatedDays),
        revivesPer24h: Math.round(revivesPer24h * 10) / 10,
        confidence,
        warning,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to calculate skill goal estimate")
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      // Reset state when closing
      setTargetSkill("")
      setResult(null)
      setError(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button className="rounded-lg p-2 transition-all hover:bg-muted" aria-label="Skill Goal Calculator">
          <Target className="h-6 w-6 text-red-500" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skill Goal Calculator</DialogTitle>
          <DialogDescription>Estimate how many revives you need to reach your target skill level</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-skill">Current Skill</Label>
            <Input id="current-skill" type="number" value={currentSkill.toFixed(2)} disabled className="bg-muted" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-skill">Target Skill Level</Label>
            <Input
              id="target-skill"
              type="number"
              placeholder="Enter target skill (e.g., 50)"
              value={targetSkill}
              onChange={(e) => setTargetSkill(e.target.value)}
              disabled={loading}
              min={currentSkill}
              max={100}
              step={0.01}
            />
          </div>

          <Button onClick={handleCalculate} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Calculating...
              </>
            ) : (
              "Calculate"
            )}
          </Button>

          {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          {result && (
            <div className="space-y-3 rounded-lg border bg-card p-4">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm font-semibold">Estimate Summary</span>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    result.confidence === "high"
                      ? "bg-green-500/20 text-green-500"
                      : result.confidence === "medium"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {result.confidence} confidence
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Skill Needed:</span>
                  <span className="text-base font-semibold">+{result.skillNeeded.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg Gain per 24h:</span>
                  <span className="text-base font-semibold text-blue-500">+{result.avgGainPer24h.toFixed(3)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Revives per 24h:</span>
                  <span className="text-base font-semibold">{result.revivesPer24h}</span>
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Estimated Revives:</span>
                    <span className="text-lg font-bold text-green-500">{result.estimatedRevives.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estimated Time:</span>
                  <span className="text-lg font-bold text-purple-500">
                    {result.estimatedDays} {result.estimatedDays === 1 ? "day" : "days"}
                  </span>
                </div>
              </div>

              {result.warning && (
                <div className="mt-3 rounded-lg bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-500">
                  <strong>Note:</strong> {result.warning}
                </div>
              )}

              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                This estimate accounts for skill degradation at higher levels using the formula: base gain × (1 - 0.208
                × ln(skill)). Actual results may vary due to randomness and hospital time factors.
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            <p className="mb-1">
              <strong>Tip:</strong> Revive longer hospital times (Xanax OD, non-PvP injuries) for better gains.
            </p>
            <p>
              Formula based on research by{" "}
              <a
                href="https://www.torn.com/forums.php#/p=threads&f=61&t=16007535&b=0&a=0"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-blue-400"
              >
                Terrorist007
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
