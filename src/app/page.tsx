import { ProductList } from '@/components/ProductList/ProductList'
import { getPhones } from '@/services/phones.service'

export default async function HomePage() {
  const phones = await getPhones()

  return (
    <main>
      <ProductList phones={phones} />
    </main>
  )
}
