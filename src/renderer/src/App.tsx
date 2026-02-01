import { useQuery, useMutation } from '@tanstack/react-query'
import { orpc } from './lib/orpc'
import { useState } from 'react'
import electronLogo from './assets/electron.svg'

function App(): React.JSX.Element {
  const [message, setMessage] = useState('')

  // Query: Get system info from main process
  const { data: systemInfo, isLoading } = useQuery(orpc.demo.getSystemInfo.queryOptions({}))

  // Mutation: Echo message
  const echoMutation = useMutation(orpc.demo.echo.mutationOptions({}))

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
      </main>
    </div>
  )
}

export default App
