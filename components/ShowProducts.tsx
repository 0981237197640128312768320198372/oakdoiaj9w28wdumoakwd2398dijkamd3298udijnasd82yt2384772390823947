/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState, useEffect } from "react"
import { ProductsList } from "@/components/ProductsList"
import CartModal from "@/components/CartModal"

const ShowProducts = () => {
  const [isCartOpen, setCartOpen] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch product data from the API when component mounts
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/get_products")
        const data = await response.json()

        // Add unique ID for each product's duration option
        const productsWithIds = data.map((product: any) => ({
          ...product,
          name: product.name,
          details: product.details.map((detail: any) => ({
            ...detail,
            id: `${product.name.replace(/\s+/g, "")}-${detail.duration.replace(
              /\s+/g,
              "-"
            )}`,
          })),
        }))

        setProducts(productsWithIds)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])
  return (
    <>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <>
          <div className='fixed bottom-0 px-10 pt-10 pb-5 w-full bg-dark-700/40 backdrop-blur h-fit flex justify-center items-center border-t-[1px] border-dark-500'>
            <button
              onClick={() => setCartOpen(true)}
              className='bg-primary text-dark-800 py-2 rounded font-aktivGroteskBold text-xl px-4 w-full max-w-lg'
            >
              View Cart
            </button>
          </div>
          <ProductsList priceData={products} />
        </>
      )}
      <CartModal isOpen={isCartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}

export default ShowProducts
