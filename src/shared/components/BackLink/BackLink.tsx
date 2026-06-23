'use client'

import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'

import ArrowAngleIcon from '@/shared/components/ui/icons/ArrowAngleIcon'
import { ROUTES } from '@/shared/constants'

import styles from './BackLink.module.scss'

interface BackLinkProps {
  fallbackHref?: string
  label?: string
}

export function BackLink({ fallbackHref = ROUTES.HOME, label = 'Back' }: BackLinkProps) {
  const router = useRouter()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <nav className={styles['back-link']} aria-label="Breadcrumb">
      <button type="button" onClick={handleClick} className={styles['back-link__anchor']}>
        <ArrowAngleIcon />
        {label}
      </button>
    </nav>
  )
}
