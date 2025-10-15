/**
 * LocalStorage utilities for managing Torn API Key
 */

const TORN_API_KEY = "torn_api_key"

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
