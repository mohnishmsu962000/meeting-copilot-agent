export function MeetingControls({ status, timer, formatTime, onStart, onEnd, error }) {
  return (
    <div style={{
      height: '64px',
      background: '#0a0a0a',
      borderTop: '1px solid #222',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {status === 'active' && (
          <>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#ef4444',
              animation: 'pulse 1.5s infinite',
            }} />
            <span style={{ fontSize: '13px', color: '#666', fontVariantNumeric: 'tabular-nums' }}>
              {formatTime(timer)}
            </span>
          </>
        )}
        {status === 'connecting' && (
          <span style={{ fontSize: '13px', color: '#666' }}>Connecting...</span>
        )}
        {status === 'idle' && (
          <span style={{ fontSize: '13px', color: '#444' }}>Ready to start</span>
        )}
        {status === 'ended' && (
          <span style={{ fontSize: '13px', color: '#444' }}>Meeting ended</span>
        )}
        {error && (
          <span style={{ fontSize: '13px', color: '#ef4444' }}>{error}</span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {status === 'idle' && (
          <button
            onClick={onStart}
            style={{
              background: '#4a9eff',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            Start Meeting
          </button>
        )}
        {(status === 'active' || status === 'connecting') && (
          <button
            onClick={onEnd}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            End Meeting
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}