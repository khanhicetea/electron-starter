import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Send } from 'lucide-react'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const [message, setMessage] = useState('')

  // Query: Get system info from main process
  const { data: systemInfo, isLoading } = useQuery(orpc.demo.getSystemInfo.queryOptions({}))

  // Mutation: Echo message
  const echoMutation = useMutation(orpc.demo.echo.mutationOptions({}))

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* System Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>Platform details from main process</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Platform:</span>
                <span className="font-mono">{systemInfo?.platform}</span>
                <span className="text-muted-foreground">Architecture:</span>
                <span className="font-mono">{systemInfo?.arch}</span>
                <span className="text-muted-foreground">Node Version:</span>
                <span className="font-mono">{systemInfo?.nodeVersion}</span>
                <span className="text-muted-foreground">Electron:</span>
                <span className="font-mono">{systemInfo?.electronVersion}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Echo Demo Card */}
        <Card>
          <CardHeader>
            <CardTitle>Echo Demo</CardTitle>
            <CardDescription>Test the RPC mutation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                onClick={() => echoMutation.mutate({ message })}
                disabled={echoMutation.isPending || !message}
              >
                {echoMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {echoMutation.data && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p><strong>Response:</strong> {echoMutation.data.echoed}</p>
                <p className="text-muted-foreground text-xs mt-1">
                  {new Date(echoMutation.data.timestamp).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}