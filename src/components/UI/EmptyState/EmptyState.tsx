import styles from './EmptyState.module.scss'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No results found.' }: EmptyStateProps) {
  return (
    <output className={styles.empty}>
      <p className={styles.empty__message}>{message}</p>
    </output>
  )
}
