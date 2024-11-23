/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import React, { useState } from "react"
import { useCart } from "@/context/CartContext"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"
import { PiShoppingCartLight, PiTrashLight } from "react-icons/pi"
import Image from "next/image"
import netflixpremium from "@/assets/images/netflixpremiumuhd.png"
import primevideo from "@/assets/images/amazonprimevideo.png"
import Link from "next/link"
import PersonalKeyModal from "@/components/PersonalKeyModal"
import { MdOutlineAccountBalanceWallet } from "react-icons/md"
import dokmailogosquare from "@/assets/images/dokmailogosquare.png"

const CartModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { cart, updateQuantity, removeFromCart, total, clearCart } = useCart()
  const [showPersonalKeyModal, setShowPersonalKeyModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<
    "success" | "insufficient" | "error" | null
  >(null)
  const [orderedItems, setOrderedItems] = useState<any[]>([])

  if (!isOpen) return null

  const handleCheckout = async () => {
    const personalKey = localStorage.getItem("personalKey")
    if (!personalKey) {
      setShowPersonalKeyModal(true)
      return
    }

    setLoading(true)

    try {
      const verifyResponse = await fetch("/api/verify_checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personalKey,
          selectedProducts: cart.map((item) => ({
            name: item.appName,
            quantity: item.quantity,
            duration: item.duration,
          })),
        }),
      })

      const verifyData = await verifyResponse.json()
      if (!verifyResponse.ok)
        throw new Error(verifyData.error || "Checkout failed")

      const balanceResponse = await fetch("/api/update_balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personalKey, purchaseTotal: total }),
      })

      const balanceData = await balanceResponse.json()
      if (!balanceResponse.ok)
        throw new Error(balanceData.error || "Balance update failed")

      setOrderedItems(cart)
      setStatus("success")
      clearCart()
    } catch (error: any) {
      if (error.message.includes("Insufficient balance")) {
        setStatus("insufficient")
      } else {
        setStatus("error")
      }
    } finally {
      setLoading(false)
    }
  }

  const SuccessModal = () => (
    <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center'>
      <div className='bg-dark-800 border-[1px] border-dark-500 p-5 rounded flex flex-col items-start w-fit shadow-black shadow-2xl'>
        <h2 className='text-primary mt-1 text-2xl text-start pb-5 border-b-[1px] border-dark-600 w-full'>
          คำสั่งซื้อสำเร็จแล้ว √
        </h2>
        <div className='w-full mb-10 gap-5'>
          {orderedItems.map((item, i) => (
            <div
              key={i}
              className='flex justify-between items-center border-b border-dark-600 py-3 gap-14'
            >
              <div className='w-full flex gap-3 items-center'>
                <Image
                  src={
                    item.appName.includes("Netflix")
                      ? netflixpremium
                      : primevideo
                  }
                  alt={`${item.appName} image`}
                  width={60}
                  height={60}
                  className='select-none'
                  loading='lazy'
                />
                <div className='flex flex-col'>
                  <p className='text-xs font-thin'>
                    {formatProductName(item.appName)}
                  </p>
                  <div className='flex gap-3 items-center'>
                    <span className='px-1 text-sm font-aktivGroteskBold bg-primary text-dark-800 font-bold'>
                      {item.duration}
                    </span>
                    <p className='text-light-100 font-medium'>฿ {item.price}</p>
                  </div>
                </div>
              </div>
              <div className='flex items-center gap-3 text-xs px-2 py-1 rounded bg-dark-700 border-[1px] border-dark-500'>
                x{item.quantity}
              </div>
            </div>
          ))}
        </div>
        <div className='w-full flex justify-between items-end text-xs'>
          <Link
            href='/your-premium-apps'
            className='text-primary px-2 py-1 font-aktivGroteskRegular rounded border-[0.7px] border-primary'
          >
            Go to Dashboard
          </Link>
          <button
            className='bg-primary text-dark-800 active:bg-primary/80 px-2 py-1 font-aktivGroteskBold rounded'
            onClick={() => setStatus(null)}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )

  const InsufficientBalanceModal = () => (
    <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center'>
      <div className='bg-dark-800 border-[1px] border-dark-500 p-5 rounded flex flex-col items-end w-fit shadow-black shadow-2xl'>
        <p className='text-light-300 text-center mb-4'>
          คุณมี Dokmai Coin ไม่เพียงพอในการชำระเงิน.
        </p>
        <div className='flex justify-between w-full text-xs'>
          <Link
            href='/deposit'
            className='flex gap-2 items-center bg-white/10 text-xs hover:bg-primary/10 hover:text-primary rounded p-2'
          >
            <MdOutlineAccountBalanceWallet className='w-5 h-5 ' />
            Deposit Dokmai Coin
          </Link>
          <button
            onClick={() => setStatus(null)}
            className='text-red-600 bg-red-600/20 active:bg-red-600/10 rounded px-2 py-1'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  const ErrorModal = () => (
    <div className='fixed inset-0 z-50 bg-black/50 backdrop-blur flex items-center justify-center'>
      <div className='bg-dark-800 border-[1px] border-dark-500 p-5 rounded flex flex-col items-end w-fit shadow-black shadow-2xl'>
        <p className='text-light-300 text-center mb-4'>
          เกิดข้อผิดพลาดในการชำระเงิน หากปัญหายังไม่หาย
          กรุณาติดต่อแอดมินเพื่อช่วยเหลือ ขอบคุณค่ะ
        </p>
        <div className='flex justify-between w-full text-xs'>
          <Link
            href='https://lin.ee/Ovlixv5'
            className='flex gap-2 items-center bg-white/10 text-xs hover:bg-primary/10 hover:text-primary rounded p-2'
          >
            Contact Admin
          </Link>
          <button
            onClick={() => setStatus(null)}
            className='text-red-600 bg-red-600/20 active:bg-red-600/10 rounded px-2 py-1'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )

  function formatProductName(name: string): string {
    return name.replace(/([A-Z])/g, " $1").trim()
  }

  return loading ? (
    <div className='fixed top-0 left-0 z-[9999999999999] w-screen h-screen flex flex-col justify-center items-center bg-dark-800'>
      <div className='relative flex flex-col items-center justify-center gap-3'>
        <div className='w-32 h-32 border-y-[1px] border-y-primary/30 border-x-2 border-x-primary rounded-full animate-spin'></div>
        <Image
          src={dokmailogosquare}
          alt='Loading Logo | Dokmai Store'
          width={200}
          height={200}
          loading='lazy'
          className='absolute p-5 animate-pulse'
        />
      </div>
      <p className='mt-2'>Processing...</p>
    </div>
  ) : (
    <div className='fixed inset-0 bg-dark-800/20 backdrop-blur-lg flex justify-center items-end z-50'>
      <div className='w-full max-w-lg bg-dark-800 p-4 rounded-t-lg border-[1px] border-dark-600'>
        <div className='flex justify-between items-center pb-4 mb-5 border-b-[1px] border-dark-600'>
          <h2 className='text-lg font-bold text-light-200 flex items-center gap-2'>
            <PiShoppingCartLight className='text-primary text-xl' /> Your Cart
          </h2>
          <button
            onClick={onClose}
            className='text-red-600 bg-red-600/20 active:bg-red-600/10 rounded px-2 py-1'
          >
            Close
          </button>
        </div>

        {cart.length === 0 ? (
          <p className='text-light-200 text-center'>Your cart is empty.</p>
        ) : (
          <div>
            {cart.map((item) => (
              <div
                key={item.id}
                className='flex justify-between items-center py-3 gap-5'
              >
                <div className='w-full flex gap-3 items-center'>
                  <Image
                    src={
                      item.appName.includes("Netflix")
                        ? netflixpremium
                        : primevideo
                    }
                    alt={`${item.appName} image`}
                    width={60}
                    height={60}
                    className='select-none'
                    loading='lazy'
                  />
                  <div className='flex flex-col'>
                    <p className='text-xs font-thin'>
                      {formatProductName(item.appName)}
                    </p>
                    <div className='flex gap-3 items-center'>
                      <span className='px-2 py-1 text-sm bg-primary text-dark-800 font-bold'>
                        {item.duration}
                      </span>
                      <p className='text-light-100 font-medium'>
                        ฿ {item.price}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center'>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className='p-1 text-xs text-light-400 rounded-full border border-light-400'
                    >
                      <AiOutlineMinus />
                    </button>
                    <span className='px-3 text-light-200'>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className='p-1 text-xs text-light-400 rounded-full border border-light-400'
                    >
                      <AiOutlinePlus />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className='text-red-500 bg-red-600/20 active:bg-red-600/10 rounded p-2'
                  >
                    <PiTrashLight className='text-lg' />
                  </button>
                </div>
              </div>
            ))}
            <div className='flex justify-between items-center pt-4  gap-8'>
              <span className='text-light-200 font-bold'>Total:</span>
              <div className='w-full h-[1px] bg-dark-500' />
              <span className='text-light-200 font-bold whitespace-nowrap'>
                ฿ {total}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full mt-4 bg-primary active:bg-primary/80 text-dark-800 py-2 rounded font-bold text-xl ${
                loading ? "opacity-80 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Processing..." : "Checkout"}
            </button>
          </div>
        )}
      </div>

      {showPersonalKeyModal && (
        <PersonalKeyModal
          onClose={() => setShowPersonalKeyModal(false)}
          handleCheckout={handleCheckout}
        />
      )}
      {status === "success" && <SuccessModal />}
      {status === "insufficient" && <InsufficientBalanceModal />}
      {status === "error" && <ErrorModal />}
    </div>
  )
}

export default CartModal
