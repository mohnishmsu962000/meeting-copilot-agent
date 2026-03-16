export function SuggestionPanel({ suggestions }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      background: '#111',
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
        AI Suggestions
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {suggestions.length === 0 ? (
          <div style={{
            color: '#444',
            fontSize: '14px',
            textAlign: 'center',
            marginTop: '40px',
          }}>
            AI suggestions will appear as you speak...
          </div>
        ) : (
          suggestions.map((s, i) => (
            <div key={i} style={{
              background: '#1a1a1a',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div>
                <div style={{
                  fontSize: '10px',
                  color: '#4a9eff',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}>
                  Insight
                </div>
                <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
                  {s.insight}
                </p>
              </div>

              <div>
                <div style={{
                  fontSize: '10px',
                  color: '#4ade80',
                  fontWeight: '600',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '6px',
                }}>
                  Follow-up question
                </div>
                <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
                  {s.follow_up_question}
                </p>
              </div>

              {s.technical_explanation && (
                <div>
                  <div style={{
                    fontSize: '10px',
                    color: '#f59e0b',
                    fontWeight: '600',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}>
                    Technical context
                  </div>
                  <p style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6' }}>
                    {s.technical_explanation}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}