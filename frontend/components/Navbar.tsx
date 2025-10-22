'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { ThemeToggle } from './ThemeToggle'

const navigation = [
  { name: 'Dashboard', href: '/' },
  { name: 'Anomalies', href: '/anomalies' },
  { name: 'Logs', href: '/logs' },
  { name: 'Insights', href: '/insights' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOnline] = useState(true)

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                  <span className="text-white font-bold text-lg">TQ</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                    TraceIQ
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    Security Intelligence
                  </div>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    pathname === item.href
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {/* Live Status Indicator */}
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div
                className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isOnline ? 'bg-green-500 animate-pulse shadow-sm' : 'bg-red-500'
                )}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isOnline ? 'Live' : 'Offline'}
              </span>
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}
