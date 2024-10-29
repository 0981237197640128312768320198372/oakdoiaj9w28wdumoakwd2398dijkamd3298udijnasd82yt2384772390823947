import React from "react"
import { useCart } from "@/context/CartContext"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"
import { PiShoppingCartLight } from "react-icons/pi"
import { PiTrashLight } from "react-icons/pi"
import Image from "next/image"
import netflixpremium from "@/assets/images/netflixpremiumuhd.png"
import primevideo from "@/assets/images/amazonprimevideo.png"

const CartModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const { cart, updateQuantity, removeFromCart, total } = useCart()

  if (!isOpen) return null

  // Function to handle checkout simulation
  const handleCheckout = () => {
    console.log("Checkout data:", cart)
    console.log("Total price:", total)
    // Add any additional logic here if needed
    alert("Sorry. Checkout Page Under Maintenance!.")
  }

  return (
    <div className='fixed inset-0 bg-dark-800/20 backdrop-blur-lg flex justify-center items-end z-50'>
      <div className='w-full max-w-lg bg-dark-800 p-4 rounded-t-lg border-[1px] border-dark-500'>
        <div className='flex justify-between items-center pb-4 mb-5 border-b-[1px] border-dark-500 '>
          <h2 className='text-lg font-bold text-light-200 flex items-center gap-2 justify-center'>
            <PiShoppingCartLight className='text-primary text-xl' />
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className='text-red-600 bg-red-600/20 rounded px-2 py-1'
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
                className='flex justify-between items-center border-b border-dark-600 py-3 gap-5'
              >
                <div className='w-full gap-3 flex'>
                  <div className='mr-3'>
                    {item.appName === "Netflix Premium" && (
                      <Image
                        src={netflixpremium}
                        alt='High Quality Netflix Premium Cheap Price | Dokmai Store'
                        width={75}
                        height={75}
                        className='w-fit select-none'
                        loading='lazy'
                      />
                    )}
                    {item.appName === "Prime Video" && (
                      <Image
                        src={primevideo}
                        alt='High Quality Prime Video Cheap Price | Dokmai Store'
                        width={75}
                        height={75}
                        className='w-fit select-none'
                        loading='lazy'
                      />
                    )}
                  </div>

                  <div className='flex w-full flex-col items-start'>
                    <p className='text-light-200 font-aktivGroteskBold mt-1'>
                      {item.type}
                    </p>
                    <div className='flex gap-3'>
                      <span className='px-2 py-1 text-sm bg-primary text-dark-800 font-aktivGroteskBold whitespace-nowrap'>
                        {item.duration}
                      </span>
                      <p className='whitespace-nowrap text text-light-100 font-aktivGroteskMedium'>
                        ฿ {item.price}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='flex gap-5 items-center'>
                  <div className='flex items-center border-y-[1px] border-dark-500 py-3'>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className='p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
                    >
                      <AiOutlineMinus />
                    </button>
                    <span className='px-3 text-light-200'>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className='p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
                    >
                      <AiOutlinePlus />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className='text-red-500 bg-red-600/20 w-fit h-fit rounded p-2'
                  >
                    <PiTrashLight className='text-lg' />
                  </button>
                </div>
              </div>
            ))}
            <div className='flex justify-between items-center pt-4 border-t border-dark-600'>
              <span className='text-light-200 font-bold'>Total:</span>
              <span className='text-light-200 font-bold'>฿ {total}</span>
            </div>
            <button
              onClick={handleCheckout}
              className='w-full mt-4 bg-primary text-dark-800 py-2 rounded font-aktivGroteskBold text-xl'
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CartModal
