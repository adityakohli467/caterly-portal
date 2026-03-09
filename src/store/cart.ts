import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface ProductOption {
  option_id: number
  option_name: string
  option_value_id: number
  option_value: string
  product_option_id: number
  option_price: string
  option_price_prefix: string
}

interface CartItem {
  product_id: number
  product_name: string
  product_price: string
  quantity: number
  product_image?: string
  options?: ProductOption[]
  cart_item_id?: string // Unique ID for items with different options
  delivery_frequency?: string // "One Time", "2 Weeks", "4 Weeks", "8 Weeks"
  delivery_start_date?: string // ISO date string for subscription start
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity" | "cart_item_id"> & { quantity?: number }) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  updateDeliveryFrequency: (cartItemId: string, frequency: string) => void
  updateDeliveryStartDate: (cartItemId: string, startDate: string) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemPrice: (item: CartItem) => number
}

// Generate unique cart item ID based on product and options
export const generateCartItemId = (productId: number, options?: ProductOption[], deliveryFrequency?: string, deliveryStartDate?: string): string => {
  let id = `product_${productId}`

  if (options && options.length > 0) {
    const sortedOptions = [...options].sort((a, b) => a.option_id - b.option_id)
    const optionsKey = sortedOptions
      .map(opt => `${opt.option_id}_${opt.option_value_id}`)
      .join('_')
    id += `_opts_${optionsKey}`
  }

  if (deliveryFrequency && deliveryFrequency !== "One Time") {
    id += `_freq_${deliveryFrequency.replace(/\s+/g, '_').toLowerCase()}`
  }

  if (deliveryStartDate) {
    id += `_start_${deliveryStartDate}`
  }

  return id
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items
        const cartItemId = generateCartItemId(item.product_id, item.options, item.delivery_frequency, item.delivery_start_date)
        const quantity = item.quantity || 1

        const existing = items.find((i) => {
          const existingId = i.cart_item_id || generateCartItemId(i.product_id, i.options, i.delivery_frequency, i.delivery_start_date)
          return existingId === cartItemId
        })

        if (existing) {
          set({
            items: items.map((i) => {
              const existingId = i.cart_item_id || generateCartItemId(i.product_id, i.options)
              return existingId === cartItemId
                ? { ...i, quantity: i.quantity + quantity }
                : i
            }),
          })
        } else {
          set({
            items: [...items, {
              ...item,
              quantity,
              cart_item_id: cartItemId,
              delivery_frequency: item.delivery_frequency || "One Time", // Default to One Time
            }]
          })
        }
      },

      removeItem: (cartItemId) => {
        set({
          items: get().items.filter((i) => {
            const itemId = i.cart_item_id || generateCartItemId(i.product_id, i.options, i.delivery_frequency, i.delivery_start_date)
            return itemId !== cartItemId
          })
        })
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
        } else {
          set({
            items: get().items.map((i) => {
              const itemId = i.cart_item_id || generateCartItemId(i.product_id, i.options, i.delivery_frequency, i.delivery_start_date)
              return itemId === cartItemId ? { ...i, quantity } : i
            }),
          })
        }
      },

      updateDeliveryFrequency: (cartItemId, frequency) => {
        set({
          items: get().items.map((i) => {
            const itemId = i.cart_item_id || generateCartItemId(i.product_id, i.options, i.delivery_frequency, i.delivery_start_date)
            if (itemId === cartItemId) {
              const newId = generateCartItemId(i.product_id, i.options, frequency, i.delivery_start_date)
              return { ...i, delivery_frequency: frequency, cart_item_id: newId }
            }
            return i
          }),
        })
      },

      updateDeliveryStartDate: (cartItemId, startDate) => {
        set({
          items: get().items.map((i) => {
            const itemId = i.cart_item_id || generateCartItemId(i.product_id, i.options, i.delivery_frequency, i.delivery_start_date)
            if (itemId === cartItemId) {
              const newId = generateCartItemId(i.product_id, i.options, i.delivery_frequency, startDate)
              return { ...i, delivery_start_date: startDate, cart_item_id: newId }
            }
            return i
          }),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getItemPrice: (item) => {
        let basePrice = Number.parseFloat(item.product_price)

        // Add option prices
        if (item.options && item.options.length > 0) {
          for (const option of item.options) {
            const optionPrice = Number.parseFloat(option.option_price || "0")
            if (option.option_price_prefix === '+') {
              basePrice += optionPrice
            } else if (option.option_price_prefix === '-') {
              basePrice -= optionPrice
            } else {
              // Default to add
              basePrice += optionPrice
            }
          }
        }

        return basePrice
      },

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => {
            const itemPrice = get().getItemPrice(item)
            return total + itemPrice * item.quantity
          },
          0
        )
      },
    }),
    {
      name: "cart-storage",
    }
  )
)


