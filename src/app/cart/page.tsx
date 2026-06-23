import { CartView } from '@/features/cart/components/CartView/CartView'
import { buildPageMetadata } from '@/shared/lib/siteMetadata'

export const metadata = buildPageMetadata({
  title: 'Cart',
  description:
    'Review the smartphones in your cart, check selected options, and continue shopping.',
})

export default function CartPage() {
  return <CartView />
}
