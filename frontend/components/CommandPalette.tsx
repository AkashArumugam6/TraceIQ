'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon,
  HomeIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  LightBulbIcon,
  CogIcon,
  XMarkIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline'

interface Command {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  action: () => void
  keywords: string[]
  category: string
}

export function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const commands: Command[] = [
    {
      id: 'dashboard',
      title: 'Go to Dashboard',
      description: 'View the main security dashboard',
      icon: <HomeIcon className="h-5 w-5" />,
      action: () => router.push('/'),
      keywords: ['dashboard', 'home', 'main'],
      category: 'Navigation'
    },
    {
      id: 'anomalies',
      title: 'View Anomalies',
      description: 'See all detected security anomalies',
      icon: <ExclamationTriangleIcon className="h-5 w-5" />,
      action: () => router.push('/anomalies'),
      keywords: ['anomalies', 'threats', 'alerts'],
      category: 'Navigation'
    },
    {
      id: 'logs',
      title: 'View Logs',
      description: 'Browse system logs and events',
      icon: <DocumentTextIcon className="h-5 w-5" />,
      action: () => router.push('/logs'),
      keywords: ['logs', 'events', 'history'],
      category: 'Navigation'
    },
    {
      id: 'insights',
      title: 'AI Insights',
      description: 'View AI-powered security insights',
      icon: <LightBulbIcon className="h-5 w-5" />,
      action: () => router.push('/insights'),
      keywords: ['insights', 'ai', 'analysis'],
      category: 'Navigation'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure application settings',
      icon: <CogIcon className="h-5 w-5" />,
      action: () => router.push('/settings'),
      keywords: ['settings', 'config', 'preferences'],
      category: 'Navigation'
    },
    {
      id: 'search',
      title: 'Global Search',
      description: 'Search across all data',
      icon: <MagnifyingGlassIcon className="h-5 w-5" />,
      action: () => {
        onClose()
        // Trigger search modal
        const searchButton = document.querySelector('[data-search-trigger]') as HTMLButtonElement
        searchButton?.click()
      },
      keywords: ['search', 'find', 'query'],
      category: 'Actions'
    },
    {
      id: 'dark-mode',
      title: 'Toggle Dark Mode',
      description: 'Switch between light and dark themes',
      icon: <div className="h-5 w-5 rounded bg-gray-800 dark:bg-gray-200" />,
      action: () => {
        const themeToggle = document.querySelector('[data-theme-toggle]') as HTMLButtonElement
        themeToggle?.click()
      },
      keywords: ['dark', 'light', 'theme', 'mode'],
      category: 'Actions'
    }
  ]

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Filter commands based on query
  useEffect(() => {
    if (!query.trim()) {
      setFilteredCommands(commands)
      setSelectedIndex(0)
      return
    }

    const filtered = commands.filter(command => 
      command.title.toLowerCase().includes(query.toLowerCase()) ||
      command.description.toLowerCase().includes(query.toLowerCase()) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(query.toLowerCase()))
    )

    setFilteredCommands(filtered)
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action()
          onClose()
        }
        break
    }
  }

  // Group commands by category
  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.category]) {
      acc[command.category] = []
    }
    acc[command.category].push(command)
    return acc
  }, {} as Record<string, Command[]>)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-25 dark:bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <CommandLineIcon className="h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                <CommandLineIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No commands found</p>
                <p className="text-sm mt-2">Try a different search term</p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                  <div key={category} className="mb-4">
                    <div className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {category}
                    </div>
                    <div className="space-y-1">
                      {categoryCommands.map((command, index) => {
                        const globalIndex = filteredCommands.findIndex(c => c.id === command.id)
                        const isSelected = globalIndex === selectedIndex
                        
                        return (
                          <button
                            key={command.id}
                            onClick={() => {
                              command.action()
                              onClose()
                            }}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white'
                            }`}
                          >
                            <div className={`flex-shrink-0 ${
                              isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {command.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{command.title}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {command.description}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="flex-shrink-0 text-blue-600 dark:text-blue-400">
                                <kbd className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 rounded">
                                  Enter
                                </kbd>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">↑↓</kbd> to navigate</span>
                <span>Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Enter</kbd> to select</span>
              </div>
              <span>Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">Esc</kbd> to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
