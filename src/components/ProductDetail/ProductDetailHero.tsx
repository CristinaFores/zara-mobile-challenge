'use client'

import { ColorSelector } from '@/components/ColorSelector/ColorSelector'
import { ProductImage } from '@/components/ProductImage/ProductImage'
import { StorageSelector } from '@/components/StorageSelector/StorageSelector'
import { Button } from '@/components/UI/Button/Button'
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
  const imageSlots = useImageCrossfade(selection.imageUrl)
  const priceSlots = useTextCrossfade(selection.priceLabel)
  const imageAlt = `${phone.brand} ${phone.name}`

  return (
    <section className={styles['product-detail-hero']} aria-label={imageAlt}>
      <div className={styles['product-detail-hero__gallery']}>
        {imageSlots.map((slot, index) => (
          <figure
            key={index}
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
          {priceSlots.map((slot, index) => (
            <span
              key={index}
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
