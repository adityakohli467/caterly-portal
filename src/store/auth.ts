import { create } from "zustand"
import { persist } from "zustand/middleware"
import { api } from "@/lib/api"

interface User {
  user_id: number
  email: string
  username: string
  auth_level?: number
}

interface AuthState {
  user: User | null
  customer: any | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  forgotPassword: (email: string) => Promise<void>
  verifyResetToken: (token: string) => Promise<{ valid: boolean; email?: string }>
  resetPassword: (token: string, password: string) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      customer: null,
      token: null,
      isAuthenticated: false,

      login: async (username, password) => {
        try {
          const response = await api.post("/store/auth/login", { username, password })
          const { token, user, customer } = response.data

          if (!token) {
            throw new Error("No token received from server")
          }

          // Store in state and localStorage (Zustand persist will handle localStorage)
          set({
            user,
            customer,
            token,
            isAuthenticated: true,
          })

          // Also set a cookie for middleware (4 hours expiration to match JWT)
          if (typeof document !== 'undefined') {
            // Use more explicit cookie setting
            const expires = new Date()
            expires.setTime(expires.getTime() + (4 * 60 * 60 * 1000)) // 4 hours
            document.cookie = `caterly-auth=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`

            // Also ensure localStorage has the token (backup)
            try {
              const authData = JSON.stringify({
                state: {
                  user,
                  customer,
                  token,
                  isAuthenticated: true,
                },
                version: 0,
              })
              localStorage.setItem('caterly-auth', authData)
            } catch (e) {
              console.warn("Failed to save auth to localStorage:", e)
            }
          }

          // Wait a moment to ensure state is persisted
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error: any) {
          const message = error.response?.data?.message || "Login failed"
          throw new Error(message)
        }
      },

      register: async (data) => {
        try {
          const response = await api.post("/store/auth/register", data)
          const { token, user, customer } = response.data

          if (token && typeof window !== "undefined") {
            // Merge registration address fields into customer so checkout
            // can pre-fill them immediately as the default address.
            const enrichedCustomer = {
              ...customer,
              address_line1: data.address_line1 || customer?.address_line1 || "",
              suburb: data.suburb || customer?.suburb || "",
              state: data.state || customer?.state || "",
              postal_code: data.postal_code || customer?.postal_code || "",
            }

            // Store in state and localStorage
            set({
              user,
              customer: enrichedCustomer,
              token,
              isAuthenticated: true,
            })

            // Also set a cookie for middleware (4 hours expiration to match JWT)
            document.cookie = `caterly-auth=${token}; path=/; max-age=${60 * 60 * 4}; SameSite=Lax`

            // Silently attempt to save address as default via profile API
            // (best-effort — registration is not blocked if this fails)
            try {
              await api.post(
                "/store/customer/update",
                {
                  address_line1: data.address_line1,
                  suburb: data.suburb,
                  state: data.state,
                  postal_code: data.postal_code,
                },
                { headers: { Authorization: `Bearer ${token}` } }
              )
            } catch {
              // Silently ignore — address is already stored in local state above
            }
          }
        } catch (error: any) {
          const message = error.response?.data?.message || "Registration failed"
          throw new Error(message)
        }
      },

      logout: () => {
        set({
          user: null,
          customer: null,
          token: null,
          isAuthenticated: false,
        })

        // Clear the cookie
        if (typeof document !== 'undefined') {
          document.cookie = 'caterly-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        }
      },

      checkAuth: async () => {
        // Get token from both state and localStorage (in case state hasn't hydrated)
        let token = get().token

        // If no token in state, try to get from localStorage
        if (!token && typeof window !== 'undefined') {
          try {
            const auth = localStorage.getItem('caterly-auth')
            if (auth) {
              const parsed = JSON.parse(auth)
              token = parsed.state?.token
            }
          } catch (e) {
            // Ignore parse errors
          }
        }

        if (!token) {
          set({ isAuthenticated: false })
          return
        }

        try {
          const response = await api.get("/store/auth/me")
          set({
            user: response.data.user,
            customer: response.data.customer,
            isAuthenticated: true,
            token: token, // Ensure token is set
          })
        } catch (error: any) {
          // Only clear auth on 401 (unauthorized) - don't clear on network errors
          const errorStatus = error?.response?.status
          if (errorStatus === 401) {
            // Token expired or invalid - clear auth
            set({
              user: null,
              customer: null,
              token: null,
              isAuthenticated: false,
            })

            // Clear storage
            if (typeof document !== 'undefined') {
              localStorage.removeItem('caterly-auth')
              localStorage.removeItem('token')
              document.cookie = 'caterly-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
            }
          } else {
            // For other errors (network, 500, etc.), don't clear auth
            // Just log for debugging
            if (process.env.NODE_ENV === 'development') {
              console.warn("Auth check failed (non-401):", error)
            }
            // Don't throw - let the user stay logged in
          }
        }
      },

      forgotPassword: async (email: string) => {
        await api.post("/store/auth/forgot-password", { email })
      },

      verifyResetToken: async (token: string) => {
        const response = await api.get("/store/auth/verify-reset-token", {
          params: { token },
        })
        return response.data
      },

      resetPassword: async (token: string, password: string) => {
        await api.post("/store/auth/reset-password", { token, password })
      },
    }),
    {
      name: "caterly-auth",
    }
  )
)


