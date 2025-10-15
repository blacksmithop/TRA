/**
 * API configuration for Torn Logbook
 *
 * Set the NEXT_PUBLIC_API_URL environment variable to configure the backend API URL.
 * Default: http://localhost:8000
 */
import { getApiKey } from "./storage" // Import storage utilities to get API key from localStorage

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

export async function fetchRevives() {
  return fetchTornAPI("/logs/revives")
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

export function getLogoUrl() {
  return `${API_BASE_URL}/static/logo`
}
