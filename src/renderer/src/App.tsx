import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import electronLogo from '@/assets/electron.svg'
import { orpc } from '@/lib/orpc'

function App(): React.JSX.Element {
  const [message, setMessage] = useState('')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const queryClient = useQueryClient()

  // Query: Get system info from main process
  const { data: systemInfo, isLoading } = useQuery(orpc.demo.getSystemInfo.queryOptions({}))

  // Mutation: Echo message
  const echoMutation = useMutation(orpc.demo.echo.mutationOptions({}))

  // Query: Get all notes
  const { data: notes, isLoading: notesLoading } = useQuery(orpc.notes.getAll.queryOptions({}))

  // Mutation: Create note
  const createNoteMutation = useMutation({
    ...orpc.notes.create.mutationOptions({}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.getAll.queryKey({})
      })
      setNoteTitle('')
      setNoteContent('')
    }
  })

  // Mutation: Delete note
  const deleteNoteMutation = useMutation({
    ...orpc.notes.delete.mutationOptions({}),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: orpc.notes.getAll.queryKey({})
      })
    }
  })

  const handleCreateNote = () => {
    if (noteTitle && noteContent) {
      createNoteMutation.mutate({ title: noteTitle, content: noteContent })
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <img alt="logo" className="logo" src={electronLogo} />
        <h1>Electron + ORPC + React Query</h1>
        <p className="subtitle">Type-safe RPC with end-to-end types</p>
      </header>

      <main className="app-main">
        <div className="cards-grid">
          {/* Query Demo */}
          <div className="info-card">
            <h3>Query: System Info</h3>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <div className="info-grid">
                <span>Platform:</span>
                <span>{systemInfo?.platform}</span>
                <span>Architecture:</span>
                <span>{systemInfo?.arch}</span>
                <span>Node Version:</span>
                <span>{systemInfo?.nodeVersion}</span>
                <span>Electron:</span>
                <span>{systemInfo?.electronVersion}</span>
              </div>
            )}
          </div>

          {/* Mutation Demo */}
          <div className="info-card">
            <h3>Mutation: Echo</h3>
            <div className="form-row">
              <input
                type="text"
                placeholder="Enter a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                onClick={() => echoMutation.mutate({ message })}
                disabled={echoMutation.isPending || !message}
              >
                {echoMutation.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>

            {echoMutation.data && (
              <div className="result">
                <p>
                  <strong>Response:</strong> {echoMutation.data.echoed}
                </p>
                <p>
                  <strong>Timestamp:</strong>{' '}
                  {new Date(echoMutation.data.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="notes-section">
          <h2>📝 Notes (SQLite + Kysely)</h2>

          {/* Create Note Form */}
          <div className="info-card">
            <h3>Create Note</h3>
            <div className="form-column">
              <input
                type="text"
                placeholder="Note title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
              <textarea
                placeholder="Note content..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={3}
              />
              <button
                onClick={handleCreateNote}
                disabled={createNoteMutation.isPending || !noteTitle || !noteContent}
              >
                {createNoteMutation.isPending ? 'Creating...' : 'Create Note'}
              </button>
            </div>
          </div>

          {/* Notes List */}
          <div className="info-card">
            <h3>All Notes</h3>
            {notesLoading ? (
              <p>Loading notes...</p>
            ) : notes && notes.length > 0 ? (
              <div className="notes-list">
                {notes.map((note) => (
                  <div key={note.id} className="note-item">
                    <div className="note-header">
                      <strong>{note.title}</strong>
                      <button
                        className="delete-btn"
                        onClick={() => deleteNoteMutation.mutate({ id: note.id })}
                        disabled={deleteNoteMutation.isPending}
                      >
                        ✕
                      </button>
                    </div>
                    <p>{note.content}</p>
                    <small className="note-date">
                      Created: {new Date(note.created_at).toLocaleString()}
                    </small>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No notes yet. Create one above!</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
