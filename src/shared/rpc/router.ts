import { os } from '@orpc/server'
import { z } from 'zod'

// Base ORPC instance with empty context
const base = os.$context<{}>()

// ============ Demo Procedures ============

const demoProcedures = {
  // Query: Get system info from main process
  getSystemInfo: base.handler(async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      nodeVersion: process.version,
      electronVersion: process.versions.electron ?? 'unknown',
      timestamp: Date.now()
    }
  }),

  // Mutation: Echo message back with timestamp
  echo: base.input(z.object({ message: z.string() })).handler(async ({ input }) => {
    return {
      original: input.message,
      echoed: `Echo: ${input.message}`,
      timestamp: Date.now()
    }
  })
}

// ============ Router Definition ============

export const router = {
  demo: demoProcedures
}

export type AppRouter = typeof router
