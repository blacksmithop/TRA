"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { fetchRevives, fetchReviveStats, fetchProfile } from "@/lib/api"
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

const GAINS_PER_BUCKET: Record<number, number> = {
  0: 0.25,
  10: 0.18,
  20: 0.14,
  30: 0.11,
  40: 0.08,
  50: 0.06,
  90: 0.015,
}

function getGainPerRevive(skill: number): number {
  const bucket = Math.floor(skill / 10) * 10
  
  if (bucket in GAINS_PER_BUCKET) {
    return GAINS_PER_BUCKET[bucket]
  }
  
  // Extrapolate for 60-80: linear decrease from 50 (0.06) to 90 (0.015)
  if (bucket >= 50 && bucket < 90) {
    return Math.max(0.015, 0.06 + (bucket - 50) * -0.001125) // Adjusted for smoother curve
  }
  
  // Below 0 or above 90: clamp
  return bucket < 0 ? 0.25 : 0.015
}

function calculateRevivesPerDay(userRevives: Revive[]): number {
  if (userRevives.length < 5) {
    return 25 // Fallback for insufficient data
  }

  const timeSpan = userRevives[userRevives.length - 1].timestamp - userRevives[0].timestamp
  const days = timeSpan / 86400
  
  return userRevives.length / Math.max(days, 0.1) // Prevent division by zero
}

function calculateDataPoints(userRevives: Revive[]): number {
  let gainCount = 0
  
  for (let i = 1; i < userRevives.length; i++) {
    const gain = userRevives[i].reviver.skill! - userRevives[i - 1].reviver.skill!
    if (gain > 0 && gain < 1) {
      gainCount++
    }
  }
  
  return gainCount
}

function estimateRevivesNeeded(currentSkill: number, targetSkill: number): number {
  let estimatedRevives = 0
  let simulatedSkill = currentSkill
  const stepSize = 0.01
  
  while (simulatedSkill < targetSkill) {
    const gain = getGainPerRevive(simulatedSkill)
    
    if (gain <= 0.001) {
      // Near max skill, use very small steps
      estimatedRevives += (targetSkill - simulatedSkill) / 0.001
      break
    }
    
    const stepsInBucket = Math.min(stepSize / gain, 1)
    estimatedRevives += stepsInBucket
    simulatedSkill += stepSize
    
    // Adjust if crossed bucket boundary
    const currentBucket = Math.floor(simulatedSkill / 10)
    const previousBucket = Math.floor((simulatedSkill - stepSize) / 10)
    
    if (currentBucket !== previousBucket) {
      simulatedSkill = currentBucket * 10 + 0.01 // Reset to bucket start
    }
  }
  
  return estimatedRevives
}

function getConfidenceLevel(dataPoints: number): "low" | "medium" | "high" {
  if (dataPoints >= 20) return "high"
  if (dataPoints >= 10) return "medium"
  return "low"
}

function getWarningMessage(dataPoints: number, targetSkill: number, existingWarning?: string): string {
  let warning = existingWarning
  
  if (dataPoints < 5) {
    warning = "Low data: Using fallback 25 revives/day"
  }
  
  if (targetSkill >= 90) {
    warning = warning ? `${warning}. At 90+, gains ~0.015/revive` : "At 90+, gains ~0.015/revive"
  } else if (targetSkill >= 80) {
    warning = warning ? `${warning}. Gains decrease at higher levels` : "Gains decrease at higher levels"
  }
  
  return warning || ""
}

export function SkillGoalCalculator() {
  const [targetSkill, setTargetSkill] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SkillGoalResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentSkill, setCurrentSkill] = useState<number>(0)
  const [userId, setUserId] = useState<number | null>(null)

  useEffect(() => {
    const loadProfileAndSkill = async () => {
      try {
        const profile = await fetchProfile()
        setUserId(profile.profile.id)

        const stats: ReviveStats = await fetchReviveStats()
        const reviveSkillStat = stats.personalstats.find(s => s.name === "reviveskill")
        if (reviveSkillStat) {
          setCurrentSkill(reviveSkillStat.value)
        }
      } catch (err) {
        console.error("[v0] Failed to load profile/skill:", err)
      }
    }
    
    loadProfileAndSkill()
  }, [])

  const handleCalculate = async () => {
    if (!userId) {
      setError("User ID not loaded. Please try again.")
      return
    }

    const target = Number.parseFloat(targetSkill)
    
    if (isNaN(target)) {
      setError("Please enter a valid target skill level")
      return
    }
    
    if (target <= currentSkill) {
      setError("Target must be higher than current skill")
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
      const now = Math.floor(Date.now() / 1000)
      const oneDayAgo = now - 86400
      const revivesData = await fetchRevives(userId, oneDayAgo)
      const revives: Revive[] = revivesData.revives || []

      const userRevives = revives
        .filter(r => r.reviver.id === userId && r.reviver.skill !== null)
        .sort((a, b) => a.timestamp - b.timestamp)

      const revivesPer24h = calculateRevivesPerDay(userRevives)
      const dataPoints = calculateDataPoints(userRevives)
      const skillNeeded = target - currentSkill
      const estimatedRevives = estimateRevivesNeeded(currentSkill, target)
      const estimatedDays = estimatedRevives / revivesPer24h
      const avgGainPer24h = skillNeeded / estimatedDays
      const confidence = getConfidenceLevel(dataPoints)
      const warning = getWarningMessage(dataPoints, target)

      setResult({
        currentSkill,
        targetSkill: target,
        skillNeeded,
        avgGainPer24h: Math.round(avgGainPer24h * 1000) / 1000,
        estimatedRevives: Math.ceil(estimatedRevives),
        estimatedDays: Math.ceil(estimatedDays),
        revivesPer24h: Math.round(revivesPer24h * 10) / 10,
        confidence,
        warning: warning || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    setTargetSkill(value)
    // Clear result when user changes input
    if (result) {
      setResult(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="current-skill">Current Skill Level</Label>
        <Input 
          id="current-skill" 
          type="number" 
          value={currentSkill.toFixed(2)} 
          disabled 
          className="bg-muted font-mono" 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="target-skill">Target Skill Level</Label>
        <Input
          id="target-skill"
          type="number"
          placeholder="e.g., 50.0"
          value={targetSkill}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={loading}
          min={currentSkill + 0.01}
          max={100}
          step={0.1}
          className="font-mono"
        />
        <p className="text-xs text-muted-foreground">
          Enter a value between {currentSkill.toFixed(2)} and 100
        </p>
      </div>

      <Button 
        onClick={handleCalculate} 
        disabled={loading || !targetSkill} 
        className="w-full"
      >
        {loading ? (
          <>
            <Spinner className="mr-2 h-4 w-4" />
            Calculating...
          </>
        ) : (
          "Calculate Goal"
        )}
      </Button>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

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

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Skill Needed:</span>
              <span className="text-base font-semibold">+{result.skillNeeded.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Avg Gain per 24h:</span>
              <span className="text-base font-semibold text-blue-500">
                +{result.avgGainPer24h.toFixed(3)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Revives per 24h:</span>
              <span className="text-base font-semibold">{result.revivesPer24h}</span>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estimated Revives:</span>
                <span className="text-lg font-bold text-green-500">
                  {result.estimatedRevives.toLocaleString()}
                </span>
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
            Gains based on historical data (average per skill bucket)
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        <p className="mb-1">
          <strong>Tip:</strong> Lower success rates typically yield higher skill gains per revive
        </p>
      </div>
    </div>
  )
}