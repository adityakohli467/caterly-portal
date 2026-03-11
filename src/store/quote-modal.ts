import { create } from "zustand"

interface QuoteModalStore {
  isOpen: boolean
  open: () => void
  close: () => void
}

export const useQuoteModalStore = create<QuoteModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}))
