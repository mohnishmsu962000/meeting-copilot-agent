import { useEffect, useRef } from 'react'

export function TranscriptPanel({ transcript }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [transcript])

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#141414',
      borderRight: '1px solid #222',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #222',
        fontSize: '12px',
        fontWeight: '500',
        color: '#666',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Live Transcript
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {transcript.length === 0 ? (
          <div style={{
            color: '#444',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '40px',
          }}>
            Transcript will appear here...
          </div>
        ) : (
          transcript.map((chunk, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {chunk.speaker && (
                <span style={{
                  fontSize: '11px',
                  color: '#555',
                  fontWeight: '500',
                }}>
                  {chunk.speaker}
                </span>
              )}
              <p style={{
                fontSize: '15px',
                lineHeight: '1.6',
                color: '#ddd',
              }}>
                {chunk.text}
              </p>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}