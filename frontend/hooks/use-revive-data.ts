"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { hasApiKey } from "@/lib/storage"
import type { RevivesResponse, ReviveStats, UserBarsResponse, CorrelationData } from "@/lib/types"
import { fetchProfile, fetchReviveSkillCorrelation, fetchReviveStats, fetchBars, fetchRevivesFull } from "@/lib/api"
import { loadRevivesProgressively } from "@/lib/progressive-loader"

export function useReviveData() {
  const router = useRouter()
  const [userId, setUserId] = useState<number | undefined>(undefined)
  const [revives, setRevives] = useState<RevivesResponse | null>(null)
  const [correlationData, setCorrelationData] = useState<CorrelationData | null>(null)
  const [reviveStats, setReviveStats] = useState<ReviveStats | null>(null)
  const [barsData, setBarsData] = useState<UserBarsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasAccessError, setHasAccessError] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [loadingGraph, setLoadingGraph] = useState(false)
  const [loadingRevivesList, setLoadingRevivesList] = useState(false)
  const [loadingEnergy, setLoadingEnergy] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [totalRevivesLoaded, setTotalRevivesLoaded] = useState(0)
  const [initialRevivesLoading, setInitialRevivesLoading] = useState(true)
  const [showFullRevives, setShowFullRevives] = useState(false)

  // Check API key
  useEffect(() => {
    if (!hasApiKey()) {
      router.replace("/login")
    }
  }, [router])

  // Load profile
  useEffect(() => {
    let mounted = true
    const loadProfile = async () => {
      try {
        const profileData = await fetchProfile()
        if (!mounted) return
        if (!profileData?.profile?.id) throw new Error("Invalid profile")
        setUserId(profileData.profile.id)
      } catch (err) {
        console.error(err)
        if (err instanceof Error && err.message.includes("Access level")) setHasAccessError(true)
        if (mounted) setLoading(false)
      }
    }
    loadProfile()
    return () => { mounted = false }
  }, [])

  // Load main data
  useEffect(() => {
    if (!userId) return
    let mounted = true

    const loadData = async () => {
      try {
        const [corr, stats, bars] = await Promise.all([
          fetchReviveSkillCorrelation(userId),
          fetchReviveStats(),
          fetchBars(),
        ])
        if (!mounted) return
        setCorrelationData(corr)
        setReviveStats(stats)
        setBarsData(bars)
        setLoading(false)
        setIsLoadingMore(true)

        loadRevivesProgressively(userId, {
          onBatchLoaded: (batch, done) => {
            if (!mounted) return
            const data = { revives: batch }
            setRevives(data)
            setTotalRevivesLoaded(batch.length)
            setInitialRevivesLoading(false)
            if (done) setIsLoadingMore(false)
          },
          onError: () => {
            if (mounted) {
              setIsLoadingMore(false)
              setInitialRevivesLoading(false)
            }
          },
        })
      } catch (err) {
        console.error(err)
        if (mounted) {
          setLoading(false)
          setIsLoadingMore(false)
          setInitialRevivesLoading(false)
        }
      }
    }

    loadData()

    const interval = setInterval(async () => {
      try {
        const bars = await fetchBars()
        if (mounted) setBarsData(bars)
      } catch {}
    }, 30000)

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [userId])

  const reloadStatsAndGraph = async () => {
    if (!userId) return
    setLoadingStats(true)
    setLoadingGraph(true)
    try {
      const [corr, stats] = await Promise.all([
        fetchReviveSkillCorrelation(userId),
        fetchReviveStats(),
      ])
      setCorrelationData(corr)
      setReviveStats(stats)
      setInitialRevivesLoading(true)
      setIsLoadingMore(true)
      loadRevivesProgressively(userId, {
        onBatchLoaded: (batch, done) => {
          setRevives({ revives: batch })
          setTotalRevivesLoaded(batch.length)
          setInitialRevivesLoading(false)
          if (done) setIsLoadingMore(false)
        },
        onError: () => {
          setIsLoadingMore(false)
          setInitialRevivesLoading(false)
        },
      })
    } finally {
      setLoadingStats(false)
      setLoadingGraph(false)
    }
  }

  const reloadEnergy = async () => {
    setLoadingEnergy(true)
    try {
      const bars = await fetchBars()
      setBarsData(bars)
    } finally {
      setLoadingEnergy(false)
    }
  }

  const reloadRevivesList = async () => {
    setLoadingRevivesList(true)
    try {
      if (showFullRevives) {
        const data = await fetchRevivesFull()
        setRevives(data)
      } else {
        setInitialRevivesLoading(true)
        setIsLoadingMore(true)
        loadRevivesProgressively(userId!, {
          onBatchLoaded: (batch, done) => {
            setRevives({ revives: batch })
            setTotalRevivesLoaded(batch.length)
            setInitialRevivesLoading(false)
            if (done) setIsLoadingMore(false)
          },
          onError: () => {
            setIsLoadingMore(false)
            setInitialRevivesLoading(false)
          },
        })
      }
    } finally {
      setLoadingRevivesList(false)
    }
  }

  const handleFullRevivesToggle = async (checked: boolean) => {
    setShowFullRevives(checked)
    await reloadRevivesList()
  }

  return {
    userId,
    revives,
    correlationData,
    reviveStats,
    barsData,
    loading,
    hasAccessError,
    loadingStats,
    loadingGraph,
    loadingRevivesList,
    loadingEnergy,
    isLoadingMore,
    totalRevivesLoaded,
    initialRevivesLoading,
    showFullRevives,
    reloadStatsAndGraph,
    reloadEnergy,
    reloadRevivesList,
    handleFullRevivesToggle,
  }
}