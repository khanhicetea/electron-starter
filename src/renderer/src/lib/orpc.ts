import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/message-port'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import type { RouterClient } from '@orpc/server'
import type { AppRouter } from '../../../shared/rpc'

// Create MessageChannel for communication
const { port1: clientPort, port2: serverPort } = new MessageChannel()

// Send the server port to preload -> main process
window.postMessage('orpc:connect', '*', [serverPort])

// Create the RPC link using the client port
const link = new RPCLink({
  port: clientPort
})

// Start the client port
clientPort.start()

// Create the typed ORPC client
export const orpcClient: RouterClient<AppRouter> = createORPCClient(link)

// Create TanStack Query utilities
export const orpc = createTanstackQueryUtils(orpcClient)

// Re-export types for convenience
export type { AppRouter }
