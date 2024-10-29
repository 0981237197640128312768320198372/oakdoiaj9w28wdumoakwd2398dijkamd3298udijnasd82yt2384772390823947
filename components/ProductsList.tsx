/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCart } from "@/context/CartContext"
import Image from "next/image"
import netflixpremium from "@/assets/images/netflixpremiumuhd.png"
import primevideo from "@/assets/images/amazonprimevideo.png"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"

export const ProductsList = ({ priceData }: { priceData: any[] }) => {
  const { addToCart, updateQuantity, getCartItemQuantity, removeFromCart } =
    useCart()

  return (
    <div className='w-full grid lg:grid-cols-2 gap-10 mt-24'>
      {priceData.map((product, i) => (
        <div
          className='flex flex-col w-full gap-3 rounded-lg border-[1px] border-dark-600 bg-dark-700 p-5'
          key={i}
        >
          <div className='flex w-full justify-between items-start border-b-[1px] border-dark-500 pb-5'>
            <div className='flex flex-col'>
              <h2 className='font-aktivGroteskBold text-white'>
                {product.type}
              </h2>
              <p className='font-aktivGroteskThin text-xs'>
                {product.description}
              </p>
            </div>
            {product.appName === "Netflix Premium" && (
              <Image
                src={netflixpremium}
                alt='High Quality Netflix Premium Cheap Price | Dokmai Store'
                width={85}
                height={85}
                className='w-fit select-none'
                loading='lazy'
              />
            )}
            {product.appName === "Prime Video" && (
              <Image
                src={primevideo}
                alt='High Quality Prime Video Cheap Price | Dokmai Store'
                width={85}
                height={85}
                className='w-fit select-none'
                loading='lazy'
              />
            )}
          </div>
          <div className='flex flex-col w-full'>
            {product.prices.map((price: any, i: any) => (
              <div
                className='flex w-full justify-between items-center py-3 border-b-[1px] border-dark-500'
                key={i}
              >
                <div className='flex w-fit gap-3'>
                  <span className='px-2 text-xl bg-primary text-dark-800 font-aktivGroteskBold whitespace-nowrap'>
                    {price.duration}
                  </span>
                  <p className='text-xl whitespace-nowrap'>฿ {price.price}</p>
                </div>
                <div className='flex gap-3 items-center'>
                  {getCartItemQuantity(price.id) > 0 ? (
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() =>
                          getCartItemQuantity(price.id) > 1
                            ? updateQuantity(
                                price.id,
                                getCartItemQuantity(price.id) - 1
                              )
                            : removeFromCart(price.id)
                        }
                        className='p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
                      >
                        <AiOutlineMinus />
                      </button>
                      <span className='text-white'>
                        {getCartItemQuantity(price.id)}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            price.id,
                            getCartItemQuantity(price.id) + 1
                          )
                        }
                        className='p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-30 active:bg-dark-600 active:border-light-100 '
                      >
                        <AiOutlinePlus />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        addToCart({
                          id: price.id,
                          appName: product.appName,
                          type: product.type,
                          duration: price.duration,
                          price: price.price,
                          quantity: 1,
                        })
                      }
                      className='text-white text-xs border-[1px] border-primary px-2 py-1 rounded-sm'
                    >
                      Add to cart
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
