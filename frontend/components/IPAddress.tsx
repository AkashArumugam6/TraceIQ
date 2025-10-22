'use client'

import { useState } from 'react'
import { IPDetailsPanel } from './IPDetailsPanel'

interface IPAddressProps {
  ip: string
  className?: string
  showDetails?: boolean
}

export function IPAddress({ ip, className = '', showDetails = true }: IPAddressProps) {
  const [showIPDetails, setShowIPDetails] = useState(false)

  if (!showDetails) {
    return (
      <code className={`font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded ${className}`}>
        {ip}
      </code>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowIPDetails(true)}
        className={`font-mono bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer ${className}`}
        title="Click to view IP details"
      >
        {ip}
      </button>
      
      {showIPDetails && (
        <IPDetailsPanel
          ip={ip}
          isOpen={showIPDetails}
          onClose={() => setShowIPDetails(false)}
        />
      )}
    </>
  )
}
