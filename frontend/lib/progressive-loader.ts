import { fetchRevives } from "./api"
import type { Revive, RevivesResponse } from "./types"

const DELAY_BETWEEN_FETCHES_MS = 3000 // 3 seconds
const MAX_INITIAL_BATCHES = 5 // Stop after 5 batches for lazy loading

export interface ProgressiveLoadOptions {
  onBatchLoaded: (revives: Revive[], isComplete: boolean) => void
  onError: (error: Error) => void
}

/**
 * Progressively loads all revives data by fetching older batches
 * Uses only to_timestamp parameter, letting the API determine the batch size
 */
export async function loadRevivesProgressively(options: ProgressiveLoadOptions) {
  const { onBatchLoaded, onError } = options
  const allRevives: Revive[] = []
  const seenIds = new Set<number>()

  try {
    console.log("[v0] Starting progressive revives load - fetching initial batch")

    const initialResponse: RevivesResponse = await fetchRevives()

    if (!initialResponse.revives || initialResponse.revives.length === 0) {
      console.log("[v0] No revives found")
      onBatchLoaded([], true)
      return
    }

    for (const revive of initialResponse.revives) {
      if (!seenIds.has(revive.id)) {
        seenIds.add(revive.id)
        allRevives.push(revive)
      }
    }
    console.log("[v0] Initial batch loaded:", allRevives.length, "unique revives")
    onBatchLoaded([...allRevives], false)

    // Find the oldest timestamp from the initial batch
    let oldestTimestamp = Math.min(...initialResponse.revives.map((r) => r.timestamp))
    console.log(
      "[v0] Oldest timestamp in initial batch:",
      oldestTimestamp,
      new Date(oldestTimestamp * 1000).toISOString(),
    )

    let previousToTimestamp = oldestTimestamp

    let batchNumber = 2
    while (true) {
      if (batchNumber > MAX_INITIAL_BATCHES) {
        console.log(`[v0] Reached max initial batches (${MAX_INITIAL_BATCHES}) - stopping for lazy loading`)
        onBatchLoaded([...allRevives], false) // false = not complete, more data available
        break
      }

      console.log("[v0] Waiting 3 seconds before next fetch...")
      await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_FETCHES_MS))

      if (oldestTimestamp === previousToTimestamp && batchNumber > 2) {
        console.log("[v0] to_timestamp hasn't changed - stopping to prevent infinite loop")
        onBatchLoaded([...allRevives], true)
        break
      }

      console.log(
        `[v0] Fetching batch ${batchNumber} with to_timestamp:`,
        new Date(oldestTimestamp * 1000).toISOString(),
      )

      const batchResponse: RevivesResponse = await fetchRevives(oldestTimestamp)

      if (!batchResponse.revives || batchResponse.revives.length === 0) {
        console.log("[v0] No more revives to fetch - loading complete")
        onBatchLoaded([...allRevives], true)
        break
      }

      let newRevivesCount = 0
      for (const revive of batchResponse.revives) {
        if (!seenIds.has(revive.id)) {
          seenIds.add(revive.id)
          allRevives.push(revive)
          newRevivesCount++
        }
      }

      if (newRevivesCount === 0) {
        console.log("[v0] No new revives in batch (all duplicates) - stopping")
        onBatchLoaded([...allRevives], true)
        break
      }

      console.log(
        `[v0] Batch ${batchNumber} loaded:`,
        newRevivesCount,
        "new revives (",
        batchResponse.revives.length - newRevivesCount,
        "duplicates filtered). Total:",
        allRevives.length,
      )
      onBatchLoaded([...allRevives], false)

      previousToTimestamp = oldestTimestamp
      oldestTimestamp = Math.min(...batchResponse.revives.map((r) => r.timestamp))
      console.log("[v0] Next to_timestamp will be:", oldestTimestamp, new Date(oldestTimestamp * 1000).toISOString())
      batchNumber++
    }
  } catch (error) {
    console.error("[v0] Progressive load error:", error)
    onError(error instanceof Error ? error : new Error("Failed to load revives"))
  }
}
