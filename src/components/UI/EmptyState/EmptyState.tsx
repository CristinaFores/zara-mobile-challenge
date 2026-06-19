import styles from './EmptyState.module.scss'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No results found.' }: EmptyStateProps) {
  return (
    <div className={styles.empty} role="status">
      <p className={styles.empty__message}>{message}</p>
    </div>
  )
}
