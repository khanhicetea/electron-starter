import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const getIcon = () => {
    if (theme === 'dark') {
      return <Moon className="size-4" />
    }
    if (theme === 'light') {
      return <Sun className="size-4" />
    }
    // system - show sun with indicator
    return <Sun className="size-4" />
  }

  const getLabel = () => {
    if (theme === 'dark') return 'Dark'
    if (theme === 'light') return 'Light'
    return 'System'
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-full justify-start gap-2"
    >
      {getIcon()}
      <span>{getLabel()}</span>
    </Button>
  )
}