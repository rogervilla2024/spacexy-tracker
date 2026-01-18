import { useState, useEffect, useCallback } from 'react'
import GAME_CONFIG from '../config/gameConfig'

export function useStats() {
  const [summary, setSummary] = useState(null)
  const [distribution, setDistribution] = useState([])
  const [recentRounds, setRecentRounds] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [summaryRes, distRes, roundsRes] = await Promise.all([
        fetch(`${GAME_CONFIG.apiUrl}/api/stats/summary`),
        fetch(`${GAME_CONFIG.apiUrl}/api/distribution`),
        fetch(`${GAME_CONFIG.apiUrl}/api/rounds?limit=100`)
      ])

      if (summaryRes.ok) setSummary(await summaryRes.json())
      if (distRes.ok) setDistribution(await distRes.json())
      if (roundsRes.ok) {
        const data = await roundsRes.json()
        setRecentRounds(data.items || [])
      }
    } catch (e) {
      console.error('Failed to fetch mission stats:', e)
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [fetchStats])

  return { summary, distribution, recentRounds, loading, error, refetch: fetchStats }
}

export function useRounds(page = 1, pageSize = 50) {
  const [rounds, setRounds] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRounds = async () => {
      try {
        setLoading(true)
        const offset = (page - 1) * pageSize
        const res = await fetch(`${GAME_CONFIG.apiUrl}/api/rounds?limit=${pageSize}&offset=${offset}`)
        if (res.ok) {
          const data = await res.json()
          setRounds(data.items)
          setTotal(data.total)
        }
      } catch (e) {
        console.error('Failed to fetch missions:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchRounds()
  }, [page, pageSize])

  return { rounds, total, loading, totalPages: Math.ceil(total / pageSize) }
}
