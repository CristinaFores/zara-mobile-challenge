import Link from 'next/link'

import ArrowAngleIcon from '@/components/UI/icons/ArrowAngleIcon'

import styles from './BackLink.module.scss'

interface BackLinkProps {
  href: string
  label?: string
}

export function BackLink({ href, label = 'Back' }: BackLinkProps) {
  return (
    <nav className={styles['back-link']} aria-label="Breadcrumb">
      <Link href={href} className={styles['back-link__anchor']}>
        <ArrowAngleIcon />
        {label}
      </Link>
    </nav>
  )
}
