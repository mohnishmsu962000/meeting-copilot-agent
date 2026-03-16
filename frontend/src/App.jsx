import { useMeeting } from './hooks/useMeeting'
import { TranscriptPanel } from './components/TranscriptPanel'
import { SuggestionPanel } from './components/SuggestionPanel'
import { MeetingControls } from './components/MeetingControls'

export default function App() {
  const {
    status,
    transcript,
    suggestions,
    summary,
    error,
    timer,
    formatTime,
    startMeeting,
    endMeeting,
  } = useMeeting()

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>

      <div style={{
        height: '48px',
        background: '#0a0a0a',
        borderBottom: '1px solid #222',
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: '8px',
      }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: status === 'active' ? '#4a9eff' : '#333',
        }} />
        <span style={{ fontSize: '13px', fontWeight: '500', color: '#888' }}>
          Meeting Copilot
        </span>
      </div>

      {status === 'ended' && summary ? (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '32px',
          background: '#0f0f0f',
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px', color: '#fff' }}>
            {summary.title}
          </h2>
          <p style={{ fontSize: '14px', color: '#888', marginBottom: '32px', lineHeight: '1.6' }}>
            {summary.overview}
          </p>

          <Section title="Key Points">
            {summary.key_points.map((p, i) => (
              <Item key={i} text={p} />
            ))}
          </Section>

          <Section title="Action Items">
            {summary.action_items.map((a, i) => (
              <Item key={i} text={`${a.task}${a.owner ? ` — ${a.owner}` : ''}${a.deadline ? ` (${a.deadline})` : ''}`} />
            ))}
          </Section>

          <Section title="Decisions Made">
            {summary.decisions_made.map((d, i) => (
              <Item key={i} text={d} />
            ))}
          </Section>

          <Section title="Follow-up Questions">
            {summary.follow_up_questions.map((q, i) => (
              <Item key={i} text={q} />
            ))}
          </Section>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <TranscriptPanel transcript={transcript} />
          <SuggestionPanel suggestions={suggestions} />
        </div>
      )}

      <MeetingControls
        status={status}
        timer={timer}
        formatTime={formatTime}
        onStart={startMeeting}
        onEnd={endMeeting}
        error={error}
      />
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '28px' }}>
      <h3 style={{
        fontSize: '11px',
        fontWeight: '600',
        color: '#555',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        marginBottom: '12px',
      }}>
        {title}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {children}
      </div>
    </div>
  )
}

function Item({ text }) {
  return (
    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
      <span style={{ color: '#444', marginTop: '2px', flexShrink: 0 }}>—</span>
      <p style={{ fontSize: '14px', color: '#bbb', lineHeight: '1.6' }}>{text}</p>
    </div>
  )
}