import { format, formatDistanceToNow, parseISO } from 'date-fns'

export function formatTimestamp(timestamp: string): string {
  try {
    const date = parseISO(timestamp)
    return format(date, 'MMM dd, yyyy HH:mm:ss')
  } catch {
    return 'Invalid date'
  }
}

export function formatTimeAgo(timestamp: string): string {
  try {
    const date = parseISO(timestamp)
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return 'Invalid date'
  }
}

export function formatDate(timestamp: string): string {
  try {
    const date = parseISO(timestamp)
    return format(date, 'MMM dd, yyyy')
  } catch {
    return 'Invalid date'
  }
}

export function formatTime(timestamp: string): string {
  try {
    const date = parseISO(timestamp)
    return format(date, 'HH:mm:ss')
  } catch {
    return 'Invalid time'
  }
}
