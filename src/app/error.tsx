'use client'

import { ErrorState } from '@/components/UI/ErrorState/ErrorState'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return <ErrorState message={error?.message} onRetry={reset} />
}
