import styles from './ErrorState.module.scss'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong.', onRetry }: ErrorStateProps) {
  return (
    <div className={styles.error} role="alert">
      <p className={styles.error__message}>{message}</p>
      {onRetry && (
        <button className={styles.error__retry} onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}
