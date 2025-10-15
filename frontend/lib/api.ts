/**
 * API configuration for Torn Logbook
 *
 * Set the NEXT_PUBLIC_API_URL environment variable to configure the backend API URL.
 * Default: http://localhost:8000
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Fetch wrapper for Torn API endpoints
 */
export async function fetchTornAPI(endpoint: string) {
  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch from ${endpoint}: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchProfile() {
  return fetchTornAPI("/user/profile")
}

export async function fetchBars() {
  return fetchTornAPI("/user/bars")
}

export async function fetchBattleStats() {
  return fetchTornAPI("/user/battlestats")
}

export async function fetchRevives() {
  return fetchTornAPI("/logs/revives")
}

export async function fetchReviveSkillCorrelation() {
  return fetchTornAPI("/logs/revive_skill_correlation")
}
