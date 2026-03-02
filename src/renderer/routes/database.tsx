import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { orpc } from '@/lib/orpc'

export const Route = createFileRoute('/database')({
  component: DatabaseComponent,
})

function DatabaseComponent() {
  // Query: Get all notes to show count
  const { data: notes } = useQuery(orpc.notes.getAll.queryOptions({}))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database Type</span>
              <span className="font-mono">SQLite (better-sqlite3)</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Query Builder</span>
              <span className="font-mono">Kysely</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Total Notes</span>
              <span className="font-mono">{notes?.length || 0}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}