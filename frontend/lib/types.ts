// Torn City API Types

export interface TornProfile {
  player_id: number
  name: string
  level: number
  gender: string
  status: {
    description: string
    details: string
    state: string
    color: string
    until: number
  }
  age: number
  rank: {
    level: number
    name: string
  }
  awards: number
  karma: number
  donator: number
  married: {
    spouse_id: number
    spouse_name: string
    duration: number
  }
  last_action: {
    status: string
    timestamp: number
    relative: string
  }
}

// Revives Types
export interface ReviveFaction {
  id: number
  name: string
}

export interface Reviver {
  id: number
  name: string | null
  faction?: ReviveFaction | null
  faction_id?: number | null
  skill: number | null
}

export interface ReviveTarget {
  id: number
  name: string | null
  faction?: ReviveFaction | null
  faction_id?: number | null
  hospital_reason: string
  early_discharge: boolean
  last_action: number
  online_status: "Online" | "Offline" | "Idle"
}

export interface Revive {
  id: number
  reviver: Reviver
  target: ReviveTarget
  success_chance: number
  result: "success" | "failure"
  timestamp: number
}

export interface RevivesResponse {
  revives: Revive[]
}

export interface PersonalStat {
  name: "reviveskill" | "revives" | "revivesreceived"
  value: number
  timestamp: number
}

export interface ReviveStats {
  personalstats: PersonalStat[]
}

export interface ReviveChance {
  target_score: number
  revive_chance: number
}

// Bars API Response Types
export interface Bar {
  current: number
  maximum: number
  increment: number
  interval: number
  tick_time: number
  full_time: number
}

export type Chain = {}

export interface Bars {
  energy: Bar
  nerve: Bar
  happy: Bar
  life: Bar
  chain: Chain | null
}

export interface UserBarsResponse {
  bars: Bars
}
