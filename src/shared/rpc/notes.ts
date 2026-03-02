import { os } from '@orpc/server'
import { z } from 'zod'
import { db } from '../../main/db'

// Base ORPC instance with empty context
const base = os.$context<{}>()

export const notesRouter = {
  // Query: Get all notes
  getAll: base.handler(async () => {
    const notes = await db
      .selectFrom('notes')
      .selectAll()
      .orderBy('created_at', 'desc')
      .execute()
    return notes
  }),

  // Query: Get note by id
  getById: base.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    const note = await db
      .selectFrom('notes')
      .selectAll()
      .where('id', '=', input.id)
      .executeTakeFirst()
    return note ?? null
  }),

  // Mutation: Create note
  create: base
    .input(z.object({ title: z.string(), content: z.string() }))
    .handler(async ({ input }) => {
      const now = new Date().toISOString()
      const result = await db
        .insertInto('notes')
        .values({
          title: input.title,
          content: input.content,
          created_at: now,
          updated_at: now
        })
        .returning(['id', 'title', 'content', 'created_at', 'updated_at'])
        .executeTakeFirstOrThrow()
      return result
    }),

  // Mutation: Update note
  update: base
    .input(z.object({ id: z.number(), title: z.string().optional(), content: z.string().optional() }))
    .handler(async ({ input }) => {
      const { id, ...updates } = input
      const result = await db
        .updateTable('notes')
        .set({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .where('id', '=', id)
        .returning(['id', 'title', 'content', 'created_at', 'updated_at'])
        .executeTakeFirst()
      return result ?? null
    }),

  // Mutation: Delete note
  delete: base.input(z.object({ id: z.number() })).handler(async ({ input }) => {
    const result = await db
      .deleteFrom('notes')
      .where('id', '=', input.id)
      .returning(['id'])
      .executeTakeFirst()
    return { success: !!result }
  })
}