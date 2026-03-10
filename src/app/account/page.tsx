"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuthStore } from "@/store/auth"
import { api } from "@/lib/api"
import { ShoppingBag, User, LogOut, Lock, X, ChevronLeft, ChevronRight, CreditCard, FileText } from "lucide-react"
import { toast } from "sonner"

import { Suspense } from "react"

interface Order {
  order_id: number
  total: string | number
  order_total?: string | number
  order_status: number
  date_added: string
  delivery_date?: string
  delivery_time?: string
  shipping_address_1?: string
  item_count?: number
}

interface Subscription {
  order_id: number
  order_status: number
  order_total: string
  delivery_date_time?: string
  customer_order_name?: string
  products?: Array<{
    product_name: string
    quantity: number
  }>
}

function AccountContent() {
  const router = useRouter()
  const { user, customer, isAuthenticated, logout, token, checkAuth } = useAuthStore()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("tab") || "profile"
  const [orders, setOrders] = useState<Order[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updatingPassword, setUpdatingPassword] = useState(false)

  useEffect(() => {
    const verifyAuth = async () => {
      // First, try to restore auth from localStorage
      try {
        await checkAuth()
      } catch (error) {
        console.error("Auth check error:", error)
      }

      // Now check if authenticated (after checkAuth has run)
      const currentAuthState = useAuthStore.getState()
      if (!currentAuthState.isAuthenticated) {
        router.push("/auth/login")
        return
      }

      fetchOrders()
      fetchSubscriptions()
    }

    verifyAuth()
  }, [currentPage, router, checkAuth])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get("/store/orders", {
        params: { page: currentPage, limit: 10 },
      })

      // Handle response data safely
      const ordersData = response?.data?.orders || []
      const paginationData = response?.data?.pagination || {}

      setOrders(Array.isArray(ordersData) ? ordersData : [])
      setTotalPages(paginationData.total_pages || 1)
    } catch (error: any) {
      console.error("Failed to fetch orders:", error)

      // Handle 401 - token expired
      if (error.response?.status === 401) {
        logout()
        router.push("/auth/login")
        return
      }

      // Only show error toast if it's not a 404 or empty result
      if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.message || "Failed to load orders"
        toast.error(errorMessage)
      }

      setOrders([]) // Set empty array on error
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubscriptions = async () => {
    try {
      setSubscriptionsLoading(true)
      const response = await api.get("/store/subscriptions")

      // Handle both { subscriptions: [] } and direct array [] formats
      let subscriptionData = []
      if (Array.isArray(response.data)) {
        subscriptionData = response.data
      } else if (response.data && Array.isArray(response.data.subscriptions)) {
        subscriptionData = response.data.subscriptions
      }

      setSubscriptions(subscriptionData)
    } catch (error: any) {
      console.error("Failed to fetch subscriptions:", error)
      // Handle 401 - token expired
      if (error.response?.status === 401) {
        logout()
        router.push("/auth/login")
        return
      }
      // Don't show error if user just doesn't have subscriptions
      setSubscriptions([]) // Set empty array on error
    } finally {
      setSubscriptionsLoading(false)
    }
  }

  const handleCancelSubscription = async (subscriptionId: number) => {
    if (!confirm("Are you sure you want to cancel this subscription?")) {
      return
    }

    try {
      await api.post(`/store/subscriptions/${subscriptionId}/cancel`)
      toast.success("Subscription cancelled successfully")
      fetchSubscriptions()
    } catch (error: any) {
      console.error("Failed to cancel subscription:", error)
      toast.error(error.response?.data?.message || "Failed to cancel subscription")
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    try {
      setUpdatingPassword(true)
      await api.post("/store/auth/update-password", {
        current_password: currentPassword,
        new_password: newPassword,
      })
      toast.success("Password updated successfully")
      setShowPasswordDialog(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error("Failed to update password:", error)
      toast.error(error.response?.data?.message || "Failed to update password")
    } finally {
      setUpdatingPassword(false)
    }
  }

  const getStatusText = (status: number) => {
    const statuses: Record<number, string> = {
      0: "Cancelled",
      1: "Payment Pending",
      2: "Paid",
      4: "Awaiting Approval",
      7: "Approved",
      8: "Rejected",
    }
    return statuses[status] || "Unknown"
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-black">My Account</h1>

        <Tabs defaultValue={defaultTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-gray-600 font-medium"
            >
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-gray-600 font-medium"
            >
              Order History
            </TabsTrigger>
            <TabsTrigger
              value="subscriptions"
              className="data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm text-gray-600 font-medium"
            >
              Subscriptions
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Personal Details Card */}
              <Card className="bg-white border border-[#F2CACA] shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#E03A3E]">
                    <User className="h-5 w-5" />
                    Personal Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-black">

                  {/* Name */}
                  {(customer?.firstname || customer?.lastname) && (
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-medium">
                        {[customer?.firstname, customer?.lastname].filter(Boolean).join(" ")}
                      </p>
                    </div>
                  )}

                  {/* Username */}
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{user?.username || "—"}</p>
                  </div>

                  {/* Email */}
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{user?.email || "—"}</p>
                  </div>

                  {/* Phone */}
                  {customer?.telephone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{customer?.telephone}</p>
                    </div>
                  )}

                  {/* Address */}
                  {customer?.customer_address && (
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{customer?.customer_address}</p>
                    </div>
                  )}

                  {/* Customer Type */}
                  {customer?.customer_type && (
                    <div>
                      <p className="text-sm text-gray-500">Customer Type</p>
                      <p className="font-medium">{customer?.customer_type}</p>
                    </div>
                  )}

                  {/* Company */}
                  {customer?.company_name && (
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{customer?.company_name}</p>
                    </div>
                  )}

                  {/* ABN */}
                  {customer?.abn && (
                    <div>
                      <p className="text-sm text-gray-500">ABN</p>
                      <p className="font-medium">{customer?.abn}</p>
                    </div>
                  )}

                  {/* Department */}
                  {customer?.department_name && (
                    <div>
                      <p className="text-sm text-gray-500">Department</p>
                      <p className="font-medium">{customer?.department_name}</p>
                    </div>
                  )}

                  {/* Member Since */}
                  {customer?.customer_date_added && (
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">
                        {new Date(customer?.customer_date_added).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Account Actions Card */}
              <Card className="bg-white border border-[#F2CACA] shadow-sm rounded-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#E03A3E]">
                    <Lock className="h-5 w-5" />
                    Account
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-black">

                  {/* Account Email */}
                  <div>
                    <p className="text-sm text-gray-500">Login Email</p>
                    <p className="font-medium">{user?.email || "—"}</p>
                  </div>

                  {/* Customer ID */}
                  {customer?.customer_id && (
                    <div>
                      <p className="text-sm text-gray-500">Customer ID</p>
                      <p className="font-medium">#{customer?.customer_id}</p>
                    </div>
                  )}

                  {/* Account Status */}
                  {customer?.status !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${customer?.status === 1 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {customer?.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                  )}

                  {/* Created From */}
                  {customer?.created_from && (
                    <div>
                      <p className="text-sm text-gray-500">Registered Via</p>
                      <p className="font-medium capitalize">{customer?.created_from}</p>
                    </div>
                  )}

                  <div className="pt-2 space-y-3">
                    {/* Update Password Dialog */}
                    <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full bg-[#e03a3e] border-[#e03a3e] text-[white] hover:bg-[#e03a39]"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Update Password
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="bg-white text-black">
                        <DialogHeader>
                          <DialogTitle className="text-[#E03A3E]">Update Password</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="current-password">Current Password</Label>
                            <Input
                              id="current-password"
                              type="password"
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                              placeholder="Enter current password"
                            />
                          </div>

                          <div>
                            <Label htmlFor="new-password">New Password</Label>
                            <Input
                              id="new-password"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password (min 8 characters)"
                            />
                          </div>

                          <div>
                            <Label htmlFor="confirm-password">Confirm New Password</Label>
                            <Input
                              id="confirm-password"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              onClick={() => {
                                setShowPasswordDialog(false)
                                setCurrentPassword("")
                                setNewPassword("")
                                setConfirmPassword("")
                              }}
                            >
                              Cancel
                            </Button>

                            <Button
                              onClick={handleUpdatePassword}
                              disabled={updatingPassword}
                              className="bg-[#E03A3E] hover:bg-[#cc3236] text-white"
                            >
                              {updatingPassword ? "Updating..." : "Update Password"}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Logout */}
                    <Button
                      variant="outline"
                      className="w-full bg-[#e03a3e] border-[#e03a3e] text-[white] hover:bg-[#e03a39]"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>

                </CardContent>
              </Card>

            </div>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <ShoppingBag className="h-5 w-5" />
                  Order History
                </CardTitle>
              </CardHeader>
              {/* <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="mb-4">No orders yet</p>
                  <Link href="/shop">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.order_id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Link href={`/orders/${order.order_id}`} className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-500">
                                  Order #{order.order_id}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.date_added).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  })}
                                </p>
                                {order.item_count && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  ${parseFloat(String(order.total || 0)).toFixed(2)}
                                </p>
                                <p className={`text-sm ${
                                  order.order_status === 0 ? 'text-red-600' :
                                  order.order_status === 2 ? 'text-green-600' :
                                  order.order_status === 1 ? 'text-yellow-600' :
                                  'text-gray-600'
                                }`}>
                                  {getStatusText(order.order_status)}
                                </p>
                              </div>
                            </div>
                          </Link>
                          {order.order_status === 1 && (
                            <Button
                              onClick={(e) => {
                                e.preventDefault()
                                router.push(`/payment?order_id=${order.order_id}`)
                              }}
                              className="ml-4 bg-primary hover:bg-primary/90"
                              size="sm"
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Make Payment
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent> */}
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">No orders yet</p>
                    <Link href="/shop">
                      <Button>Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div
                          key={order.order_id}
                          className="group p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <Link
                              href={`/orders/${order.order_id}`}
                              className="flex-1"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-500">
                                    Order #{order.order_id}
                                  </p>

                                  <p className="text-sm text-gray-500">
                                    {new Date(order.date_added).toLocaleDateString(
                                      "en-US",
                                      {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                      }
                                    )}
                                  </p>

                                  {order.item_count && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      {order.item_count} item
                                      {order.item_count !== 1 ? "s" : ""}
                                    </p>
                                  )}
                                </div>

                                <div className="text-right">
                                  {/* TOTAL AMOUNT */}
                                  <p className="font-bold text-black">
                                    $
                                    {parseFloat(
                                      String(order.order_total || order.total || 0)
                                    ).toFixed(2)}
                                  </p>

                                  {/* STATUS */}
                                  <p
                                    className={`text-sm ${order.order_status === 0
                                      ? "text-red-600"
                                      : order.order_status === 2
                                        ? "text-green-600"
                                        : order.order_status === 1
                                          ? "text-yellow-600"
                                          : "text-gray-600"
                                      }`}
                                  >
                                    {getStatusText(order.order_status)}
                                  </p>
                                </div>
                              </div>
                            </Link>

                            <div className="ml-4 flex items-center gap-2">
                              {order.order_status === 1 && (
                                <Button
                                  onClick={(e) => {
                                    e.preventDefault()
                                    router.push(
                                      `/payment?order_id=${order.order_id}`
                                    )
                                  }}
                                  className="bg-[#e03a3e] hover:bg-primary/90"
                                  size="sm"
                                >
                                  <CreditCard className="h-4 w-4 mr-2" />
                                  Make Payment
                                </Button>
                              )}
                              <Button
                                onClick={(e) => {
                                  e.preventDefault()
                                  window.open(`/orders/${order.order_id}/invoice`, "_blank")
                                }}
                                className="bg-[#e03a3e] text-[white] hover:bg-[#e03a3e] border-none"
                                size="sm"
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Invoice
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>

                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages}
                        </span>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(totalPages, prev + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>

            </Card>
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions">
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <ShoppingBag className="h-5 w-5" />
                  My Subscriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {subscriptionsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="text-lg font-medium mb-2">No active subscriptions found</p>
                    <p className="mb-6 max-w-md mx-auto">
                      Subscriptions will appear here once your order is processed.
                      {typeof window !== "undefined" && localStorage.getItem("caterly_last_order_type") === "subscription" && (
                        <span className="block mt-2 text-[#E03A3E] font-semibold">
                          Note: We detected a recent subscription order. It may take a moment to sync or require a page refresh.
                        </span>
                      )}
                    </p>
                    <Link href="/shop?purchaseType=subscription">
                      <Button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-8">
                        Browse Subscriptions
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <div
                        key={subscription.order_id}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <p className="font-medium">
                                Subscription #{subscription.order_id}
                              </p>
                              <span className={`text-xs px-2 py-1 rounded ${subscription.order_status === 1 ? 'bg-green-100 text-green-800' :
                                subscription.order_status === 0 ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                {getStatusText(subscription.order_status)}
                              </span>
                            </div>
                            {subscription.products && subscription.products.length > 0 && (
                              <div className="text-sm text-gray-600 mb-2">
                                {subscription.products.map((product: any, idx: number) => (
                                  <span key={idx}>
                                    {product.product_name} x{product.quantity}
                                    {idx < (subscription.products?.length || 0) - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                            {subscription.delivery_date_time && (
                              <p className="text-sm text-gray-600 mb-2">
                                Next Delivery: {new Date(subscription.delivery_date_time).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            )}
                            <p className="font-bold text-lg">
                              ${parseFloat(subscription.order_total || '0').toFixed(2)}
                            </p>
                          </div>
                          {subscription.order_status === 1 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.order_id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E03A3E]"></div>
      </div>
    }>
      <AccountContent />
    </Suspense>
  )
}


