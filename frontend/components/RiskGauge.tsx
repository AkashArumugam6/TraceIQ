'use client'

import { cn } from '@/lib/utils/cn'

interface RiskGaugeProps {
  value: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RiskGauge({ value, size = 'md', className }: RiskGaugeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const strokeWidth = size === 'sm' ? 3 : size === 'md' ? 4 : 5
  const radius = 35 // Fixed radius for viewBox 0 0 100 100 (leaving padding)
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (value / 100) * circumference

  const getColor = (val: number) => {
    if (val >= 80) return 'text-red-500'
    if (val >= 60) return 'text-orange-500'
    if (val >= 40) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getBgColor = (val: number) => {
    if (val >= 80) return 'stroke-red-200 dark:stroke-red-800'
    if (val >= 60) return 'stroke-orange-200 dark:stroke-orange-800'
    if (val >= 40) return 'stroke-yellow-200 dark:stroke-yellow-800'
    return 'stroke-green-200 dark:stroke-green-800'
  }

  const getStrokeColor = (val: number) => {
    if (val >= 80) return 'stroke-red-500'
    if (val >= 60) return 'stroke-orange-500'
    if (val >= 40) return 'stroke-yellow-500'
    return 'stroke-green-500'
  }

  return (
    <div className={cn('relative flex items-center justify-center', sizeClasses[size], className)}>
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className={getBgColor(value)}
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-1000 ease-out', getStrokeColor(value))}
        />
      </svg>
      {/* Value text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={cn('font-bold', getColor(value), {
            'text-lg': size === 'sm',
            'text-xl': size === 'md',
            'text-2xl': size === 'lg',
          })}>
            {Math.round(value)}%
          </div>
          <div className={cn('text-gray-500 dark:text-gray-400', {
            'text-xs': size === 'sm',
            'text-sm': size === 'md',
            'text-base': size === 'lg',
          })}>
            Risk
          </div>
        </div>
      </div>
    </div>
  )
}
