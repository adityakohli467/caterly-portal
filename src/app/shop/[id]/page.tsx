"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Star,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Home,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import Image from "next/image";
import { api } from "@/lib/api";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { toast } from "sonner";
import { getProductImageUrl, getProductImageUrls } from "@/lib/product-utils";

interface Product {
  product_id: number;
  product_name: string;
  product_description: string;
  short_description?: string;
  product_price: string;
  original_price?: number;
  discounted_price?: number;
  discount_percentage?: number;
  has_discount?: boolean;
  product_image?: string;
  product_images?: Array<
    { image_url: string; image_order?: number } | string
  > | null;
  categories?: Array<{
    category_id: number;
    category_name: string;
    parent_category_id?: number;
  }>;
  options?: Array<any>;
  roast_level?: string | null;
  show_specifications?: boolean;
  show_other_info?: boolean;
  min_quantity?: number | null;
}

interface CategoryNode {
  category_id: number;
  category_name: string;
  parent_category_id?: number | null;
  children?: CategoryNode[];
}

function ProductDetailContent({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem, getItemPrice } = useCartStore();
  const { isAuthenticated, token } = useAuthStore();
  const [productId, setProductId] = useState<string>("");
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<"whole" | "ground">(
    "ground"
  );
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<
    Record<number, number>
  >({}); // option_id -> option_value_id (for radio/dropdown)
  const [selectedCheckboxOptions, setSelectedCheckboxOptions] = useState<
    Record<number, number[]>
  >({}); // option_id -> [option_value_id, ...] (for checkbox, multi-select)
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [allCategories, setAllCategories] = useState<CategoryNode[]>([]);
  const [itemComments, setItemComments] = useState("");

  // Handle params (can be Promise in Next.js 15+ or object in Next.js 14)
  useEffect(() => {
    const resolveParams = async () => {
      if (params && typeof params === "object" && "then" in params) {
        const resolved = await params;
        setProductId(resolved.id);
      } else {
        setProductId((params as { id: string }).id);
      }
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchReviews();
    }
  }, [productId]);

  // Fetch categories for breadcrumb
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("/store/products/categories");
        setAllCategories(res.data.categories || []);
      } catch {
        // ignore
      }
    };
    fetchCategories();
  }, []);

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const response = await api.get(`/store/products/${productId}/reviews`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const response = await api.get(`/store/products/${productId}`, {
        headers,
      });
      console.log("Product detail API response:", response.data);
      const prod = response.data.product;
      setProduct(prod);
      // Initialise quantity to min_quantity (if set and > 1)
      const minQty = prod?.min_quantity ? Math.max(1, parseInt(String(prod.min_quantity))) : 1;
      setQuantity(minQty);
      // Log options/values for debugging
      if (prod?.options?.length) {
        const defaults: Record<number, number> = {};
        const checkboxDefaults: Record<number, number[]> = {};

        // Debug log all options
        prod.options.forEach((opt: any) => {
          console.log(
            `OPTION [${opt.option_id}] "${opt.option_name}" type="${opt.option_type}" values(${opt.values?.length ?? 0}):`,
            opt.values
          );
        });

        // ONLY pre-select the first (top) option value of the FIRST option group
        const firstOpt = prod.options[0];
        const values = Array.isArray(firstOpt?.values) ? firstOpt.values : [];

        if (values.length > 0) {
          const rawType = (firstOpt.option_type || "").toLowerCase().trim();
          const optionType =
            rawType === "radio" || rawType === "radio_button"
              ? "radio"
              : rawType === "checkbox" || rawType === "check" || rawType === "check_button"
                ? "checkbox"
                : rawType === "dropdown" || rawType === "select" || rawType === "select_box"
                  ? "dropdown"
                  : "radio";

          if (optionType === "checkbox") {
            checkboxDefaults[firstOpt.option_id] = [values[0].option_value_id];
          } else if (optionType === "radio" || optionType === "dropdown") {
            defaults[firstOpt.option_id] = values[0].option_value_id;
          }
        }

        if (Object.keys(defaults).length > 0) {
          setSelectedOptions(defaults);
        }
        if (Object.keys(checkboxDefaults).length > 0) {
          setSelectedCheckboxOptions(checkboxDefaults);
        }
      }
      // Reset to first image when product changes
      setSelectedImageIndex(0);
    } catch (error: any) {
      console.error("Failed to fetch product:", error);
      // Don't show error for 401 - product should be viewable without auth
      if (error.response?.status === 404) {
        toast.error("Product not found");
        router.push("/shop");
      } else if (error.response?.status !== 401) {
        toast.error(
          error.response?.data?.message ||
          "Failed to load product. Please try again."
        );
      }
      // Don't redirect on auth errors - product should still be viewable
      if (error.response?.status === 404) {
        router.push("/shop");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Validate minimum quantity
    const minQty = product.min_quantity ? Math.max(1, parseInt(String(product.min_quantity))) : 1;
    if (quantity < minQty) {
      toast.error(`Minimum order quantity is ${minQty}`);
      setQuantity(minQty);
      return;
    }

    // Validate required options
    if (product.options && product.options.length > 0) {
      for (const option of product.options) {
        const rawType = (option.option_type || "").toLowerCase().trim();
        const isCheckbox = rawType === "checkbox" || rawType === "check" || rawType === "check_button";
        if (isCheckbox) {
          if (option.required && (!selectedCheckboxOptions[option.option_id] || selectedCheckboxOptions[option.option_id].length === 0)) {
            toast.error(`Please select at least one ${option.option_name}`);
            return;
          }
        } else {
          if (option.required && !selectedOptions[option.option_id]) {
            toast.error(`Please select ${option.option_name}`);
            return;
          }
        }
      }
    }

    // Build options array
    const options: any[] = [];
    if (product.options && product.options.length > 0) {
      for (const option of product.options) {
        const rawType = (option.option_type || "").toLowerCase().trim();
        const isCheckbox = rawType === "checkbox" || rawType === "check" || rawType === "check_button";
        if (isCheckbox) {
          // Multi-select: push one entry per checked value
          const checkedIds = selectedCheckboxOptions[option.option_id] || [];
          for (const valueId of checkedIds) {
            const selectedValue = option.values.find((v: any) => v.option_value_id === valueId);
            if (selectedValue) {
              options.push({
                option_id: option.option_id,
                option_name: option.option_name,
                option_value_id: selectedValue.option_value_id,
                option_value: selectedValue.option_value,
                product_option_id: selectedValue.product_option_id,
                option_price: selectedValue.product_option_price,
                option_price_prefix: selectedValue.product_option_price_prefix,
              });
            }
          }
        } else {
          const selectedValueId = selectedOptions[option.option_id];
          if (selectedValueId) {
            const selectedValue = option.values.find(
              (v: any) => v.option_value_id === selectedValueId
            );
            if (selectedValue) {
              options.push({
                option_id: option.option_id,
                option_name: option.option_name,
                option_value_id: selectedValue.option_value_id,
                option_value: selectedValue.option_value,
                product_option_id: selectedValue.product_option_id,
                option_price: selectedValue.product_option_price,
                option_price_prefix: selectedValue.product_option_price_prefix,
              });
            }
          }
        }
      }
    }

    // Use discounted price if available, otherwise use regular price
    const priceToUse =
      product.has_discount && product.discounted_price
        ? product.discounted_price.toString()
        : product.product_price;

    addItem({
      product_id: product.product_id,
      product_name: product.product_name,
      product_price: priceToUse,
      product_image: getProductImageUrl(product),
      quantity,
      options: options.length > 0 ? options : undefined,
      item_comments: itemComments || undefined,
    });
    setItemComments("");
    toast.success(`${product.product_name} added to cart`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const suffix =
      day === 1 || day === 21 || day === 31
        ? "st"
        : day === 2 || day === 22
          ? "nd"
          : day === 3 || day === 23
            ? "rd"
            : "th";
    return `${day}${suffix} ${month}, ${year}`;
  };

  const updateQuantity = (change: number) => {
    const minQty = product?.min_quantity ? Math.max(1, parseInt(String(product.min_quantity))) : 1;
    setQuantity((prev) => Math.max(minQty, prev + change));
  };

  const calculateUnitPrice = () => {
    if (!product) return 0;

    // Base price
    const basePrice = product.has_discount && product.discounted_price
      ? parseFloat(String(product.discounted_price))
      : parseFloat(String(product.product_price || "0"));

    // Radio/Dropdown Options
    const radioOptionPrice = Object.entries(selectedOptions).reduce((sum, [optId, valId]) => {
      if (!valId) return sum;
      const opt = product.options?.find((o: any) => o.option_id === parseInt(optId));
      const val = opt?.values?.find((v: any) => v.option_value_id === valId);
      if (!val) return sum;
      const p = parseFloat(String(val.product_option_price || "0"));
      return (val.product_option_price_prefix || val.option_price_prefix) === '-' ? sum - p : sum + p;
    }, 0);

    // Checkbox Options
    const checkboxOptionPrice = Object.entries(selectedCheckboxOptions).reduce((sum, [optId, valIds]) => {
      const opt = product.options?.find((o: any) => o.option_id === parseInt(optId));
      if (!opt || !valIds) return sum;
      return sum + valIds.reduce((s, vid) => {
        const val = opt.values?.find((v: any) => v.option_value_id === vid);
        if (!val) return s;
        const p = parseFloat(String(val.product_option_price || "0"));
        return (val.product_option_price_prefix || val.option_price_prefix) === '-' ? s - p : s + p;
      }, 0);
    }, 0);

    return basePrice + radioOptionPrice + checkboxOptionPrice;
  };

  const calculateSubtotal = () => {
    if (!product) return "0.00";
    return (calculateUnitPrice() * quantity).toFixed(2);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmitReview = async () => {
    if (!rating || rating < 1 || rating > 5) {
      toast.error("Please select a rating");
      return;
    }

    if (!reviewText.trim() || reviewText.trim().length < 10) {
      toast.error("Please write a review (at least 10 characters)");
      return;
    }

    try {
      setSubmittingReview(true);
      const headers: any = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await api.post(
        `/store/products/${productId}/reviews`,
        {
          rating,
          review_text: reviewText.trim(),
          reviewer_name: reviewerName.trim() || undefined,
          reviewer_email: reviewerEmail.trim() || undefined,
        },
        { headers }
      );

      toast.success(
        "Review submitted successfully! It will be reviewed before being published."
      );
      setRating(0);
      setReviewText("");
      setReviewerName("");
      setReviewerEmail("");

      // Refresh reviews
      await fetchReviews();
    } catch (error: any) {
      console.error("Failed to submit review:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit review. Please try again.";
      toast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Build breadcrumb using the `from` search param (subcategory the user came from)
  const fromCategoryId = searchParams ? parseInt(searchParams.get("from") || "") || null : null;

  // Helper to find a category in the flat+nested list
  const findCatById = (id: number): CategoryNode | null => {
    for (const cat of allCategories) {
      if (cat.category_id === id) return cat;
      const child = cat.children?.find((c) => c.category_id === id);
      if (child) return child;
    }
    return null;
  };

  // Helper to find parent of a given category id
  const findParentOfCat = (id: number): CategoryNode | null =>
    allCategories.find((c) => c.children?.some((ch) => ch.category_id === id)) || null;

  let breadcrumbSubCat: CategoryNode | null = null;
  let breadcrumbMainCat: CategoryNode | null = null;

  if (fromCategoryId) {
    // User came from a specific subcategory
    const fromCat = findCatById(fromCategoryId);
    if (fromCat) {
      const parent = findParentOfCat(fromCategoryId);
      if (parent) {
        breadcrumbMainCat = parent;
        breadcrumbSubCat = fromCat;
      } else {
        // fromCat is itself a top-level category
        breadcrumbMainCat = fromCat;
      }
    }
  } else if (product?.categories && product.categories.length > 0) {
    // Fallback: derive from product's own categories array
    // Find a subcategory (one that has a parent_category_id set)
    const subCat = product.categories.find(
      (cat) => cat.parent_category_id !== null && cat.parent_category_id !== undefined
    );
    if (subCat) {
      breadcrumbSubCat = subCat;
      // Always use allCategories tree to find the parent (product.categories may not contain it)
      const parentFromTree = allCategories.length > 0 ? findParentOfCat(subCat.category_id) : null;
      const parentById = subCat.parent_category_id
        ? allCategories.find((c) => c.category_id === subCat.parent_category_id) || null
        : null;
      breadcrumbMainCat = parentFromTree || parentById || null;
    } else {
      // All categories on the product are top-level — show the first one
      breadcrumbMainCat = product.categories[0] || null;
    }
  }

  return (
    <div className="flex flex-col bg-white">
      {/* Breadcrumb */}
      <section className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-6 py-5">
          <nav className="flex items-center flex-wrap gap-1 text-sm">
            <Link
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-500 hover:text-[#E03A3E] hover:bg-red-50 transition-all duration-200 font-medium"
            >
              <Home className="w-3.5 h-3.5" />
              Home
            </Link>
            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <Link
              href="/shop"
              className="px-3 py-1.5 rounded-full text-gray-500 hover:text-[#E03A3E] hover:bg-red-50 transition-all duration-200 font-medium"
            >
              Product Catalogue
            </Link>
            {breadcrumbMainCat && (
              <>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <Link
                  href={`/shop?category=${breadcrumbMainCat.category_id}`}
                  className="px-3 py-1.5 rounded-full text-gray-500 hover:text-[#E03A3E] hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  {breadcrumbMainCat.category_name}
                </Link>
              </>
            )}
            {breadcrumbSubCat && (
              <>
                <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                <Link
                  href={`/shop?category=${breadcrumbSubCat.category_id}`}
                  className="px-3 py-1.5 rounded-full text-gray-500 hover:text-[#E03A3E] hover:bg-red-50 transition-all duration-200 font-medium"
                >
                  {breadcrumbSubCat.category_name}
                </Link>
              </>
            )}
            <ChevronRightIcon className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            <span className="px-3 py-1.5 rounded-full bg-[#E03A3E]/10 text-[#E03A3E] font-semibold text-sm">
              {product?.product_name}
            </span>
          </nav>
        </div>
      </section>

      {/* Product Section */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                {(() => {
                  const imageUrls = getProductImageUrls(product);
                  const mainImage =
                    imageUrls[selectedImageIndex] ||
                    getProductImageUrl(product);

                  return mainImage ? (
                    <Image
                      src={mainImage}
                      alt={`${product.product_name} - Image ${selectedImageIndex + 1
                        }`}
                      fill
                      className="object-cover "
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-lg">
                        {product.product_name}
                      </span>
                    </div>
                  );
                })()}

                {/* Navigation arrows for multiple images */}
                {(() => {
                  const imageUrls = getProductImageUrls(product);
                  if (imageUrls.length > 1) {
                    return (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev > 0 ? prev - 1 : imageUrls.length - 1
                            )
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) =>
                              prev < imageUrls.length - 1 ? prev + 1 : 0
                            )
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Thumbnail Images */}
              {(() => {
                const imageUrls = getProductImageUrls(product);
                if (imageUrls.length > 1) {
                  return (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {imageUrls.map((url, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === index
                            ? "border-[#E03A3E] ring-2 ring-[#E03A3E] ring-offset-2"
                            : "border-gray-200 hover:border-gray-300"
                            }`}
                          aria-label={`View image ${index + 1}`}
                        >
                          <Image
                            src={url}
                            alt={`${product.product_name} thumbnail ${index + 1
                              }`}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  );
                }
                return null;
              })()}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {product.product_name}
              </h1>

              {(() => {
                const totalPrice = calculateUnitPrice();

                // Always show price on detail page to provide feedback as options are selected

                return (
                  <div className="flex items-center gap-3 mb-6">
                    {product.has_discount && product.original_price && product.discounted_price ? (
                      <div className="flex items-center gap-3">
                        <span className="text-xl text-gray-500 line-through">
                          ${product.original_price.toFixed(2)}
                        </span>
                        <div className="text-2xl font-bold text-[#E03A3E]">
                          ${totalPrice.toFixed(2)}
                        </div>
                        {product.discount_percentage && (
                          <Badge variant="destructive" className="text-sm">
                            {product.discount_percentage}% OFF
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-[#E03A3E]">
                        ${totalPrice.toFixed(2)}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Short Description */}
              {product.short_description && (() => {
                const lines = product.short_description
                  .split(/\r?\n/)
                  .map((l: string) => l.trim())
                  .filter((l: string) => l.length > 0);
                return lines.length > 1 ? (
                  <ul className="list-disc list-inside text-gray-700 leading-relaxed mb-6 text-base space-y-1">
                    {lines.map((line: string, i: number) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-700 leading-relaxed mb-6 text-base">
                    {product.short_description}
                  </p>
                );
              })()}



              {/* Roast Level - Only show if defined in backend */}
              {/* {product.roast_level && (
                <div className="flex items-center gap-2 mb-8">
                  <span className="text-sm font-medium text-gray-700">
                    {product.roast_level} Roast
                  </span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => {
                      // Determine roast intensity based on roast level
                      let filledBars = 0;
                      const roastLower =
                        product.roast_level?.toLowerCase() || "";
                      if (roastLower.includes("light")) {
                        filledBars = 1;
                      } else if (roastLower.includes("medium")) {
                        filledBars = 3;
                      } else if (roastLower.includes("dark")) {
                        filledBars = 5;
                      } else {
                        filledBars = 3; // Default to medium
                      }
                      return (
                        <div
                          key={i}
                          className={`w-8 h-3 rounded ${
                            i < filledBars ? "bg-amber-700" : "bg-gray-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              )} */}

              {/* Product Options */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-4 mb-6">
                  {product.options.map((option) => {
                    const rawType = (option.option_type || "").toLowerCase().trim();
                    // Normalise type aliases
                    const optionType =
                      rawType === "radio" || rawType === "radio_button"
                        ? "radio"
                        : rawType === "checkbox" || rawType === "check" || rawType === "check_button"
                          ? "checkbox"
                          : rawType === "text" || rawType === "textarea" || rawType === "input"
                            ? "text"
                            : rawType === "dropdown" || rawType === "select" || rawType === "select_box"
                              ? "dropdown"
                              : "radio"; // fallback: treat unknown types as radio

                    const getPriceDisplay = (value: any) => {
                      const displayPrice =
                        value.has_discount && value.discounted_option_price
                          ? value.discounted_option_price
                          : Number.parseFloat(value.product_option_price || "0");
                      return displayPrice > 0 ? ` (+$${displayPrice.toFixed(2)})` : "";
                    };

                    const values: any[] = Array.isArray(option.values) ? option.values : [];

                    return (
                      <div key={option.option_id}>
                        <label className="text-sm font-medium text-gray-700 mb-3 block">
                          {option.option_name}
                          {option.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </label>

                        {/* RADIO — traditional radio buttons stacked vertically */}
                        {optionType === "radio" && (
                          <div className="flex flex-col gap-2">
                            {values.map((value: any) => {
                              const isSelected = selectedOptions[option.option_id] === value.option_value_id;
                              return (
                                <label
                                  key={value.option_value_id}
                                  className="flex items-center gap-3 cursor-pointer group"
                                  onClick={() =>
                                    setSelectedOptions((prev) => ({
                                      ...prev,
                                      [option.option_id]: value.option_value_id,
                                    }))
                                  }
                                >
                                  <span
                                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                      ? "border-[#E03A3E]"
                                      : "border-gray-300 group-hover:border-[#E03A3E]"
                                      }`}
                                  >
                                    {isSelected && (
                                      <span className="w-2.5 h-2.5 rounded-full bg-[#E03A3E]" />
                                    )}
                                  </span>
                                  <span className={`text-sm ${isSelected ? "text-black font-medium" : "text-gray-700"}`}>
                                    {value.option_value}
                                    {getPriceDisplay(value)}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {/* CHECKBOX — tick box on the left of each row, MULTIPLE selections allowed */}
                        {optionType === "checkbox" && (
                          <div className="flex flex-col gap-2">
                            {values.map((value: any) => {
                              const checkedIds = selectedCheckboxOptions[option.option_id] || [];
                              const isSelected = checkedIds.includes(value.option_value_id);
                              return (
                                <button
                                  key={value.option_value_id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedCheckboxOptions((prev) => {
                                      const current = prev[option.option_id] || [];
                                      const updated = isSelected
                                        ? current.filter((id) => id !== value.option_value_id)
                                        : [...current, value.option_value_id];
                                      return { ...prev, [option.option_id]: updated };
                                    })
                                  }
                                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm transition-all text-left ${isSelected
                                    ? "border-[#E03A3E] bg-[#FFF1F1]"
                                    : "border-gray-200 bg-white hover:border-[#E03A3E]"
                                    }`}
                                >
                                  {/* Tick box */}
                                  <span className={`w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${isSelected ? "bg-[#E03A3E] border-[#E03A3E]" : "border-gray-300"
                                    }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </span>
                                  <span className={`text-sm ${isSelected ? "text-black font-medium" : "text-gray-700"}`}>
                                    {value.option_value}{getPriceDisplay(value)}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* TEXT — text input */}
                        {optionType === "text" && (
                          <input
                            type="text"
                            placeholder={`Enter ${option.option_name}`}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E03A3E] focus:border-[#E03A3E] text-black text-sm"
                            onChange={(_e) => {
                              // Store text value; for text options you may need a separate state
                            }}
                          />
                        )}

                        {/* DROPDOWN — select */}
                        {optionType === "dropdown" && (
                          <select
                            value={selectedOptions[option.option_id] || ""}
                            onChange={(e) => {
                              setSelectedOptions((prev) => ({
                                ...prev,
                                [option.option_id]: Number.parseInt(e.target.value),
                              }));
                            }}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#E03A3E] focus:border-[#E03A3E] text-black text-sm"
                            required={option.required}
                          >
                            <option value="">Select {option.option_name}</option>
                            {values.map((value: any) => (
                              <option
                                key={value.option_value_id}
                                value={value.option_value_id}
                              >
                                {value.option_value}
                                {getPriceDisplay(value)}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quantity Selector */}
              <div className="border rounded-lg overflow-hidden mb-6">
                <div className="grid grid-cols-2 bg-gray-50 p-4 font-medium text-sm">
                  <div className="text-black">
                    Quantity
                    {product?.min_quantity && parseInt(String(product.min_quantity)) > 1 && (
                      <span className="ml-2 text-xs font-normal text-[#E03A3E]">(Min: {product.min_quantity})</span>
                    )}
                  </div>
                  <div className="text-right">Price</div>
                </div>
                <div className="grid grid-cols-2 p-4 items-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(-1)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center text-black">
                      {quantity}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right font-bold text-black">
                    {(() => {
                      const unitPrice = calculateUnitPrice();
                      const total = unitPrice * quantity;
                      return `$${total.toFixed(2)}`;
                    })()}
                  </div>
                </div>
              </div>

              {product && (
                <div className="flex items-center justify-between mb-6 text-lg font-bold">
                  <span className="text-black">Subtotal</span>
                  <span>${calculateSubtotal()}</span>
                </div>
              )}

              <div className="mb-6">
                <label className="text-sm font-bold text-black block mb-2">
                  Special instructions or comments
                </label>
                <textarea
                  placeholder="Enter any specific requests for this item..."
                  value={itemComments}
                  onChange={(e) => setItemComments(e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E03A3E] resize-none"
                />
              </div>

              {parseFloat(calculateSubtotal()) > 0 && (
                <Button
                  size="lg"
                  className="w-full py-6 bg-[#E03A3E] hover:bg-[#cc3236] text-white font-semibold text-lg"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </Button>
              )}
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs defaultValue="description" className="mb-16">
            {/* Premium Tab Bar */}
            <div className="relative">
              <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent border-b-2 border-gray-100 gap-0">
                <TabsTrigger
                  value="description"
                  className="relative rounded-none px-6 py-3.5 text-sm font-semibold text-gray-500 border-b-2 border-transparent -mb-[2px] transition-all duration-200 data-[state=active]:border-[#E03A3E] data-[state=active]:text-[#E03A3E] data-[state=active]:bg-transparent hover:text-[#E03A3E] bg-transparent"
                >
                  Description
                </TabsTrigger>
                {product.show_specifications && (
                  <TabsTrigger
                    value="specifications"
                    className="relative rounded-none px-6 py-3.5 text-sm font-semibold text-gray-500 border-b-2 border-transparent -mb-[2px] transition-all duration-200 data-[state=active]:border-[#E03A3E] data-[state=active]:text-[#E03A3E] data-[state=active]:bg-transparent hover:text-[#E03A3E] bg-transparent"
                  >
                    Specifications
                  </TabsTrigger>
                )}
                {product.show_other_info && (
                  <TabsTrigger
                    value="other"
                    className="relative rounded-none px-6 py-3.5 text-sm font-semibold text-gray-500 border-b-2 border-transparent -mb-[2px] transition-all duration-200 data-[state=active]:border-[#E03A3E] data-[state=active]:text-[#E03A3E] data-[state=active]:bg-transparent hover:text-[#E03A3E] bg-transparent"
                  >
                    Other Info
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            {/* Description Tab Content */}
            <TabsContent value="description" className="mt-0">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Header bar */}
                <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-gray-50/60">
                  <div className="w-1 h-6 rounded-full bg-[#E03A3E]" />
                  <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                    About This Product
                  </h3>
                </div>
                {/* Body */}
                <div className="px-8 py-7">
                  <div className="text-gray-700 leading-7 text-[15px] space-y-2">
                    {product.product_description
                      .split('\n')
                      .map((line, i) => (
                        <p key={i} className={line.trim() === '' ? 'mt-1' : ''}>
                          {line || '\u00A0'}
                        </p>
                      ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {product.show_specifications && (
              <TabsContent value="specifications" className="mt-0">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-gray-50/60">
                    <div className="w-1 h-6 rounded-full bg-[#E03A3E]" />
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                      Specifications
                    </h3>
                  </div>
                  <div className="px-8 py-7">
                    <p className="text-gray-700 leading-7 text-[15px]">
                      Specifications content goes here...
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}

            {product.show_other_info && (
              <TabsContent value="other" className="mt-0">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-8 py-5 border-b border-gray-100 bg-gray-50/60">
                    <div className="w-1 h-6 rounded-full bg-[#E03A3E]" />
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                      Other Information
                    </h3>
                  </div>
                  <div className="px-8 py-7">
                    <p className="text-gray-700 leading-7 text-[15px]">Other information goes here...</p>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          {/* Reviews Section */}
          <div className="mb-16">
            {/* <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-gray-500 italic mb-2">Featured</p>
                <h2 className="text-3xl font-bold text-gray-900">
                  Customer Reviews
                </h2>
              </div>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-black">
                <option>4-star reviews</option>
                <option>5-star reviews</option>
                <option>All reviews</option>
              </select>
            </div> */}

            {/* {reviewsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading reviews...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {reviews.map((review) => (
                  <div key={review.review_id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E03A3E]/10 flex items-center justify-center">
                          <span className="text-[#E03A3E] font-semibold text-sm">
                            {review.reviewer_name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-black">
                            {review.reviewer_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatDate(review.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            width="16" height="16" viewBox="0 0 24 24"
                            fill={star <= review.rating ? "#E03A3E" : "#E6E6E6"}
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-[14px] text-[#333] leading-relaxed">
                      "{review.review_text}"
                    </p>
                  </div>
                ))}
              </div>
            )} */}

            {/* <div className="flex justify-center gap-2 mb-12">
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div> */}

         
            <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100">
              <h3 className="text-xl font-bold text-black mb-6">
                Review this product
              </h3>

              <div className="mb-6">
                <p className="text-sm font-medium text-black mb-2">
                  Click to rate
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <svg
                        width="28" height="28" viewBox="0 0 24 24"
                        fill={star <= rating ? "#E03A3E" : "#E6E6E6"}
                        xmlns="http://www.w3.org/2000/svg"
                        className="cursor-pointer"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-black block mb-2">Your Review</label>
                <textarea
                  placeholder="Write your review here, what did you like the most?"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  className={`w-full border rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 resize-none focus:outline-none focus:ring-1 ${reviewText.length > 0 && reviewText.length < 10
                    ? "border-[#E03A3E] focus:ring-[#E03A3E]"
                    : "border-[#FDECEC] focus:ring-[#E03A3E]"
                    }`}
                  disabled={submittingReview}
                />
                {reviewText.length > 0 && reviewText.length < 10 && (
                  <p className="text-xs text-[#E03A3E] mt-1">
                    Please write at least 10 characters ({reviewText.length}/10)
                  </p>
                )}
              </div>

              <div className="mb-4">
                <label className="text-sm font-medium text-black mb-2 block">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  disabled={submittingReview}
                  className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-medium text-black mb-2 block">
                  Your Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={reviewerEmail}
                  onChange={(e) => setReviewerEmail(e.target.value)}
                  disabled={submittingReview}
                  className="w-full border border-[#FDECEC] rounded-lg px-4 py-3 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#E03A3E]"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition disabled:opacity-50"
                disabled={
                  submittingReview || !rating || reviewText.trim().length < 10
                }
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>

          {/* You May Also Like */}
          {/* <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                You may also Like
              </h2>
              <Link href="/shop">
                <button className="bg-[#E03A3E] hover:bg-[#cc3236] text-white px-6 py-2.5 rounded-md text-sm font-semibold transition">
                  View All
                </button>
              </Link>
            </div>

            <div className="text-center py-8 text-gray-500">
              <p>Related products will be displayed here</p>
              <Link href="/shop">
                <button className="border border-[#E03A3E] text-[#E03A3E] px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-[#FFF1F1] transition mt-4">
                  Browse All Products
                </button>
              </Link>
            </div>
          </div> */}
        </div>
      </section>
    </div>
  );
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  return (
    <Suspense fallback={<div className="container mx-auto px-6 py-12 text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div><p className="mt-4 text-gray-600">Loading...</p></div>}>
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

