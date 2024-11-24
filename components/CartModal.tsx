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
import dokmaicoin from "@/assets/images/dokmaicoin.png"
import Loading from "./Loading"

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
                  <div className='flex gap-1 items-center'>
                    <span
                      className={`px-1 text-sm mr-3 ${
                        item.appName.includes("Reseller")
                          ? "bg-goldVIP"
                          : "bg-primary"
                      } text-dark-800 font-aktivGroteskBold whitespace-nowrap`}
                    >
                      {item.duration}
                    </span>
                    <Image
                      src={dokmaicoin}
                      width={70}
                      height={70}
                      alt='Dokmai Coin '
                      className='w-8 h-8'
                    />
                    <p className='text-light-100 font-medium'>{item.price}</p>
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
            ดูบัญชีที่สั่งซื้อทั้งหมด
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
    <Loading text='กรุณารอสักครู่...' />
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
                    <div className='flex gap-1 items-center'>
                      <span
                        className={`px-1 text-sm mr-3 ${
                          item.appName.includes("Reseller")
                            ? "bg-goldVIP"
                            : "bg-primary"
                        } text-dark-800 font-aktivGroteskBold whitespace-nowrap`}
                      >
                        {item.duration}
                      </span>
                      <Image
                        src={dokmaicoin}
                        width={70}
                        height={70}
                        alt='Dokmai Coin '
                        className='w-8 h-8'
                      />
                      <p className='text-light-100 font-medium'>{item.price}</p>
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
            {(() => {
              const resellerItems = cart.filter((item) =>
                item.id.includes("Reseller")
              )
              const nonResellerItems = cart.filter(
                (item) => !item.id.includes("Reseller")
              )

              // Check if reseller items meet the minimum quantity requirement (at least 2)
              const hasValidResellerCondition =
                resellerItems.reduce((sum, item) => sum + item.quantity, 0) >= 2

              // Determine if checkout should be enabled
              const shouldEnableCheckout =
                (resellerItems.length === 0 || hasValidResellerCondition) &&
                (nonResellerItems.length > 0 || hasValidResellerCondition)

              // Determine the message to show
              let feedbackMessage = ""
              if (!hasValidResellerCondition && resellerItems.length > 0) {
                feedbackMessage =
                  "Add more reseller items to meet the minimum quantity of 2."
              }

              return (
                <div className='w-full'>
                  {/* Feedback message */}
                  {!shouldEnableCheckout && feedbackMessage && (
                    <p className='px-2 py-1 my-2 text-xs bg-red-600/20 rounded border-[1px] border-red-500/70 text-red-500 w-fit'>
                      {feedbackMessage}
                    </p>
                  )}

                  {/* Checkout button */}
                  <button
                    onClick={handleCheckout}
                    disabled={loading || !shouldEnableCheckout}
                    className={`w-full mt-4  text-dark-800 py-2 rounded font-bold text-xl ${
                      loading || !shouldEnableCheckout
                        ? "opacity-80 cursor-not-allowed bg-dark-100 active:bg-dark-100/80"
                        : " bg-primary active:bg-primary/80"
                    }`}
                  >
                    {loading ? "Processing..." : "Checkout"}
                  </button>
                </div>
              )
            })()}
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
