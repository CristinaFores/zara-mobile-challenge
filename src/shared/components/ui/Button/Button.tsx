import Link from 'next/link'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import styles from './Button.module.scss'

type ButtonVariant = 'primary' | 'secondary'

interface CommonProps {
  variant?: ButtonVariant
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

/** Action button: native `<button>` props, with `href` explicitly absent. */
type ButtonElementProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { readonly href?: undefined }

/** Navigation button: anchor props, rendered through Next `<Link>` when `href` is set. */
type LinkElementProps = CommonProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps | 'href'> & { readonly href: string }

export type ButtonProps = ButtonElementProps | LinkElementProps

/**
 * Polymorphic primary/secondary button with the shared Zara CTA styling.
 * Renders a real `<button>` for actions, or a Next `<Link>` when `href` is
 * provided (so a CTA that navigates stays an accessible anchor).
 */
export function Button({
  variant = 'primary',
  fullWidth = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    styles.button,
    styles[`button--${variant}`],
    fullWidth ? styles['button--full'] : null,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (rest.href !== undefined) {
    return (
      <Link className={classes} {...rest}>
        {children}
      </Link>
    )
  }

  return (
    <button {...rest} type={rest.type ?? 'button'} className={classes}>
      {children}
    </button>
  )
}
