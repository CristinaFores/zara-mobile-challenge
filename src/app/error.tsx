'use client'

import { ErrorState } from '@/shared/components/ui/ErrorState/ErrorState'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  return <ErrorState message={error?.message} onRetry={reset} />
}
