import Link from 'next/link'

import { ROUTES } from '@/constants'

import styles from './not-found.module.scss'

export default function NotFound() {
  return (
    <section className={styles.notFound} aria-labelledby="not-found-title">
      <p className={styles.notFound__code} aria-hidden="true">
        404
      </p>
      <h1 id="not-found-title" className={styles.notFound__message}>
        Page not found
      </h1>
      <Link href={ROUTES.HOME} className={styles.notFound__link}>
        Go back home
      </Link>
    </section>
  )
}
