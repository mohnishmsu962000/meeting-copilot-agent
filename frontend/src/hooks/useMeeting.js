import { useState, useRef, useCallback, useEffect } from 'react'

const SESSION_ID = crypto.randomUUID()

export function useMeeting() {
  const [status, setStatus] = useState('idle') // idle | connecting | active | ended
  const [transcript, setTranscript] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [timer, setTimer] = useState(0)

  const wsRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1)
    }, 1000)
  }

  const stopTimer = () => {
    clearInterval(timerRef.current)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  const startMeeting = useCallback(async () => {
    try {
      setStatus('connecting')
      setTranscript([])
      setSuggestions([])
      setSummary(null)
      setError(null)
      setTimer(0)

      // Get mic access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Open WebSocket to backend
      const ws = new WebSocket(`ws://localhost:8000/ws/meeting/${SESSION_ID}`)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('active')
        startTimer()

        // Start recording and sending audio
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
        mediaRecorderRef.current = mediaRecorder

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            ws.send(e.data)
          }
        }

        mediaRecorder.start(250) // send chunks every 250ms
      }

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (message.type === 'transcript') {
          setTranscript(prev => [...prev, message.data])
        } else if (message.type === 'suggestion') {
          setSuggestions(prev => [message.data, ...prev])
        } else if (message.type === 'error') {
          setError(message.data.message)
        }
      }

      ws.onerror = () => {
        setError('WebSocket connection failed')
        setStatus('idle')
      }

      ws.onclose = () => {
        stopTimer()
      }

    } catch (err) {
      setError(err.message)
      setStatus('idle')
    }
  }, [])

  const endMeeting = useCallback(async () => {
    try {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop()
      }

      // Stop mic
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      // Close WebSocket
      if (wsRef.current) {
        wsRef.current.close()
      }

      stopTimer()
      setStatus('ended')

      // Fetch summary
      const res = await fetch(`/meeting/end/${SESSION_ID}`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setSummary(data)
      }

    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    return () => {
      stopTimer()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  return {
    status,
    transcript,
    suggestions,
    summary,
    error,
    timer,
    formatTime,
    startMeeting,
    endMeeting,
    sessionId: SESSION_ID,
  }
}