'use client'

import { ColorSelector } from '@/components/ColorSelector/ColorSelector'
import { ProductImage } from '@/components/ProductImage/ProductImage'
import { StorageSelector } from '@/components/StorageSelector/StorageSelector'
import { Button } from '@/components/UI/Button/Button'
import { useColorVariantPreload } from '@/hooks/useColorVariantPreload'
import { useTextCrossfade } from '@/hooks/useTextCrossfade'
import type { PhoneDetail } from '@/types'

import { useImageCrossfade } from './useImageCrossfade'
import { useProductSelection } from './useProductSelection'

import styles from './ProductDetailHero.module.scss'

interface ProductDetailHeroProps {
  phone: PhoneDetail
}

export function ProductDetailHero({ phone }: ProductDetailHeroProps) {
  const selection = useProductSelection(phone)
  useColorVariantPreload(phone.colorOptions, selection.imageUrl)
  const [imageSlot0, imageSlot1] = useImageCrossfade(selection.imageUrl)
  const [priceSlot0, priceSlot1] = useTextCrossfade(selection.priceLabel)
  const imageAlt = `${phone.brand} ${phone.name}`

  return (
    <section className={styles['product-detail-hero']} aria-label={imageAlt}>
      <div className={styles['product-detail-hero__gallery']}>
        {[imageSlot0, imageSlot1].map((slot, i) => (
          <figure
            key={i === 0 ? 'image-slot-a' : 'image-slot-b'}
            className={styles['product-detail-hero__image']}
            style={{ zIndex: slot.zIndex, opacity: slot.opacity, transition: slot.transition }}
            aria-hidden={slot.opacity === 0}
          >
            <ProductImage src={slot.url} alt={imageAlt} priority onLoad={slot.onLoad} />
          </figure>
        ))}
      </div>

      <div className={styles['product-detail-hero__info']}>
        <hgroup className={styles['product-detail-hero__heading']}>
          <h1 className={styles['product-detail-hero__name']}>{phone.name}</h1>
          {[priceSlot0, priceSlot1].map((slot, i) => (
            <span
              key={i === 0 ? 'price-slot-a' : 'price-slot-b'}
              className={styles['product-detail-hero__price']}
              style={{ opacity: slot.isActive ? 1 : 0, transition: 'opacity 0.3s ease' }}
              aria-hidden={!slot.isActive}
            >
              {slot.text}
            </span>
          ))}
        </hgroup>

        <div className={styles['product-detail-hero__selectors']}>
          <StorageSelector
            options={phone.storageOptions}
            selected={selection.selectedStorage}
            onSelect={selection.setSelectedStorage}
          />

          <ColorSelector
            options={phone.colorOptions}
            selected={selection.selectedColor}
            onSelect={selection.setSelectedColor}
          />
        </div>

        <Button
          fullWidth
          onClick={selection.handleAddToCart}
          disabled={!selection.canAddToCart}
          aria-label={`Add ${imageAlt} to cart`}
        >
          Add
        </Button>
      </div>
    </section>
  )
}
