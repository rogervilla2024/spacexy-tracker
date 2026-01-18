import { useState, useEffect, useCallback, useRef } from 'react'
import GAME_CONFIG from '../config/gameConfig'

const POLL_INTERVAL = 15000

export function useWebSocket() {
  const [rounds, setRounds] = useState([])
  const [connected, setConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('Connecting...')
  const [lastUpdate, setLastUpdate] = useState(null)
  const previousRoundsRef = useRef([])
  const pollIntervalRef = useRef(null)

  const fetchRounds = useCallback(async () => {
    try {
      const res = await fetch(`${GAME_CONFIG.apiUrl}/api/rounds?limit=50`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const newRounds = data.items || []

      const prevIds = new Set(previousRoundsRef.current.map(r => r.round_id))
      const roundsWithNew = newRounds.map(r => ({
        ...r,
        isNew: !prevIds.has(r.round_id) && previousRoundsRef.current.length > 0
      }))

      const newCount = roundsWithNew.filter(r => r.isNew).length

      setRounds(roundsWithNew)
      previousRoundsRef.current = newRounds
      setConnected(true)
      setLastUpdate(new Date())
      setConnectionStatus(newCount > 0 ? `+${newCount} missions` : 'Online')

      if (newCount > 0) {
        setTimeout(() => {
          setRounds(prev => prev.map(r => ({ ...r, isNew: false })))
          setConnectionStatus('Online')
        }, 2000)
      }
    } catch (e) {
      console.error('Failed to fetch missions:', e)
      setConnected(false)
      setConnectionStatus('Signal Lost')
    }
  }, [])

  useEffect(() => {
    fetchRounds()
    pollIntervalRef.current = setInterval(fetchRounds, POLL_INTERVAL)

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [fetchRounds])

  return { rounds, connected, connectionStatus, lastUpdate, refetch: fetchRounds }
}

export default useWebSocket
