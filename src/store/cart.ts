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
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity" | "cart_item_id"> & { quantity?: number }) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemPrice: (item: CartItem) => number
}

// Generate unique cart item ID based on product and options
export const generateCartItemId = (productId: number, options?: ProductOption[]): string => {
  if (!options || options.length === 0) {
    return `product_${productId}`
  }
  const sortedOptions = [...options].sort((a, b) => a.option_id - b.option_id)
  const optionsKey = sortedOptions
    .map(opt => `${opt.option_id}_${opt.option_value_id}`)
    .join('_')
  return `product_${productId}_${optionsKey}`
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const items = get().items
        const cartItemId = generateCartItemId(item.product_id, item.options)
        const quantity = item.quantity || 1
        
        const existing = items.find((i) => {
          const existingId = i.cart_item_id || generateCartItemId(i.product_id, i.options)
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
              cart_item_id: cartItemId
            }] 
          })
        }
      },

      removeItem: (cartItemId) => {
        set({ items: get().items.filter((i) => {
          const itemId = i.cart_item_id || generateCartItemId(i.product_id, i.options)
          return itemId !== cartItemId
        }) })
      },

      updateQuantity: (cartItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(cartItemId)
        } else {
          set({
            items: get().items.map((i) => {
              const itemId = i.cart_item_id || generateCartItemId(i.product_id, i.options)
              return itemId === cartItemId ? { ...i, quantity } : i
            }),
          })
        }
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


