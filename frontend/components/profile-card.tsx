"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Minimize2, Maximize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Profile {
  id: number
  name: string
  level: number
  rank: string
  title: string
  donator_status: string
  age: number
  image: string
  gender: string
  status: {
    description: string
    state: string
    color: string
  }
  spouse?: {
    name: string
    status: string
  }
  awards: number
  friends: number
  enemies: number
  karma: number
  last_action: {
    status: string
    relative: string
  }
}

function convertDaysToYMD(totalDays: number) {
  const years = Math.floor(totalDays / 365)
  const remainingDays = totalDays % 365
  const months = Math.floor(remainingDays / 30)
  const days = remainingDays % 30

  return { years, months, days }
}

export function ProfileCard() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  useEffect(() => {
    fetch("http://localhost:8000/torn/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data.profile)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to fetch profile:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading profile...</div>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-destructive">Failed to load profile</div>
        </CardContent>
      </Card>
    )
  }

  const ageYMD = convertDaysToYMD(profile.age)

  if (isCollapsed) {
    return (
      <Card className="py-3">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Profile</CardTitle>
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle>Profile</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsCollapsed(true)}>
          <Minimize2 className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={profile.image || "/placeholder.svg"} alt={profile.name} />
              <AvatarFallback>{profile.name[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-foreground">{profile.name}</h2>
                {profile.donator_status && (
                  <Badge variant="secondary" className="bg-primary/20 text-primary text-xs">
                    {profile.donator_status}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {/* Level Box */}
              <div className="rounded-lg bg-muted/50 border border-border p-2">
                <div className="text-xs text-muted-foreground mb-1">Level</div>
                <div className="text-2xl font-bold text-foreground tracking-wider font-mono">
                  {profile.level.toString().padStart(3, "0")}
                </div>
              </div>

              {/* Age Box with tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="rounded-lg bg-muted/50 border border-border p-2 cursor-help">
                      <div className="text-xs text-muted-foreground mb-1">Age</div>
                      <div className="text-2xl font-bold text-foreground tracking-wider font-mono">
                        {ageYMD.years}Y {ageYMD.months}M {ageYMD.days}D
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{profile.age} days</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Rank Box */}
            <div className="rounded-lg bg-muted/50 border border-border p-2">
              <div className="text-xs text-muted-foreground mb-1">Rank</div>
              <div className="space-y-1">
                <div className="text-sm font-semibold text-foreground bg-background/50 rounded px-2 py-1 text-center">
                  {profile.rank}
                </div>
                <div className="text-sm font-semibold text-foreground bg-background/50 rounded px-2 py-1 text-center">
                  {profile.title}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Awards Box */}
              <div className="rounded-lg bg-muted/50 border border-border p-2">
                <div className="text-xs text-muted-foreground mb-1">Awards</div>
                <div className="text-lg font-bold text-foreground">{profile.awards}</div>
              </div>

              {/* Karma Box */}
              <div className="rounded-lg bg-muted/50 border border-border p-2">
                <div className="text-xs text-muted-foreground mb-1">Karma</div>
                <div className="text-lg font-bold text-foreground">{profile.karma}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Status Box */}
              <div className="rounded-lg bg-muted/50 border border-border p-2">
                <div className="text-xs text-muted-foreground mb-1">Status</div>
                <div className="text-sm font-medium text-foreground">{profile.status.description}</div>
              </div>

              {/* Married to Box */}
              {profile.spouse && (
                <div className="rounded-lg bg-muted/50 border border-border p-2">
                  <div className="text-xs text-muted-foreground mb-1">Married to</div>
                  <div className="text-sm font-medium text-foreground">{profile.spouse.name}</div>
                </div>
              )}
            </div>

            {/* Last seen Box */}
            <div className="rounded-lg bg-muted/50 border border-border p-2">
              <div className="text-xs text-muted-foreground mb-1">Last seen</div>
              <div className="text-sm font-medium text-foreground">{profile.last_action.relative}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
