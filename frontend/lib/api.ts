import { getApiKey } from "./storage"

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Fetch wrapper for Torn API endpoints
 */
export async function fetchTornAPI(endpoint: string) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error("No API key found. Please log in.")
  }

  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchProfile() {
  return fetchTornAPI("/user/basic")
}

export async function fetchBars() {
  return fetchTornAPI("/user/bars")
}

export async function fetchBattleStats() {
  return fetchTornAPI("/user/battlestats")
}

export async function fetchRevives(to_timestamp?: number) {
  let endpoint = "/logs/revives"
  const params = new URLSearchParams()

  if (to_timestamp !== undefined) {
    params.append("to_timestamp", to_timestamp.toString())
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`
  }

  return fetchTornAPI(endpoint)
}

export async function fetchRevivesFull() {
  return fetchTornAPI("/logs/revivesfull")
}

export async function fetchReviveSkillCorrelation(userId: number) {
  return fetchTornAPI(`/logs/revive_skill_correlation?user_id=${userId}`)
}

export async function fetchReviveStats() {
  return fetchTornAPI("/logs/revive_stats")
}

export async function fetchReviveChance(targetApiKey: string) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error("No API key found. Please log in.")
  }

  const url = `${API_BASE_URL}/logs/revive_chance?target_api_key=${encodeURIComponent(targetApiKey)}&timestamp=${Date.now()}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to calculate revive chance: ${response.statusText}`)
  }

  return response.json()
}

export function getLogoUrl() {
  return `${API_BASE_URL}/static/logo`
}
