/**
 * LocalStorage utilities for managing Torn API Key and Revive Cost
 */

const TORN_API_KEY = "torn_api_key"
const REVIVE_COST_KEY = "revive_cost"
const DEFAULT_REVIVE_COST = 25

/**
 * Get the stored Torn API key from localStorage
 */
export function getApiKey(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TORN_API_KEY)
}

/**
 * Save the Torn API key to localStorage
 */
export function setApiKey(key: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(TORN_API_KEY, key)
}

/**
 * Remove the Torn API key from localStorage
 */
export function removeApiKey(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(TORN_API_KEY)
}

/**
 * Check if an API key exists in localStorage
 */
export function hasApiKey(): boolean {
  return getApiKey() !== null
}

/**
 * Get the stored revive cost from localStorage
 */
export function getReviveCost(): number {
  if (typeof window === "undefined") return DEFAULT_REVIVE_COST
  const stored = localStorage.getItem(REVIVE_COST_KEY)
  return stored ? Number.parseInt(stored, 10) : DEFAULT_REVIVE_COST
}

/**
 * Save the revive cost to localStorage
 */
export function setReviveCost(cost: number): void {
  if (typeof window === "undefined") return
  localStorage.setItem(REVIVE_COST_KEY, cost.toString())
}
