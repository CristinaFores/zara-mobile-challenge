'use client'

import { useEffect, useState } from 'react'

interface TextSlot {
  text: string
  isActive: boolean
}

interface CrossfadeState {
  activeSlot: 0 | 1
  slot0Text: string
  slot1Text: string
  syncTargetText: string
  pendingSwitch: 0 | 1 | null
}

export function useTextCrossfade(targetText: string): readonly [TextSlot, TextSlot] {
  const [state, setState] = useState<CrossfadeState>(() => ({
    activeSlot: 0,
    slot0Text: targetText,
    slot1Text: targetText,
    syncTargetText: targetText,
    pendingSwitch: null,
  }))

  if (targetText !== state.syncTargetText) {
    const nextSlot: 0 | 1 = state.activeSlot === 0 ? 1 : 0
    setState((prev) => ({
      ...prev,
      syncTargetText: targetText,
      slot0Text: nextSlot === 0 ? targetText : prev.slot0Text,
      slot1Text: nextSlot === 1 ? targetText : prev.slot1Text,
      pendingSwitch: nextSlot,
    }))
  }

  useEffect(() => {
    const nextSlot = state.pendingSwitch
    if (nextSlot === null) return

    const id = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        activeSlot: nextSlot,
        pendingSwitch: null,
      }))
    }, 16)
    return () => clearTimeout(id)
  }, [state.pendingSwitch])

  return [
    { text: state.slot0Text, isActive: state.activeSlot === 0 },
    { text: state.slot1Text, isActive: state.activeSlot === 1 },
  ] as const
}
