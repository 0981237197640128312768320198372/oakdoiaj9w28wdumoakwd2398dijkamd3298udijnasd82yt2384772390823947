/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCart } from "@/context/CartContext"
import Image from "next/image"
import netflixpremium from "@/assets/images/netflixpremiumuhd.png"
import primevideo from "@/assets/images/amazonprimevideo.png"
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai"

export const ProductsList = ({ priceData }: { priceData: any[] }) => {
  const { addToCart, updateQuantity, getCartItemQuantity, removeFromCart } =
    useCart()

  const getTotalCartQuantityForProduct = (productName: string) => {
    return priceData
      .filter((product) => product.name === productName)
      .reduce((total, product) => {
        return (
          total +
          product.details.reduce(
            (sum: number, detail: any) => sum + getCartItemQuantity(detail.id),
            0
          )
        )
      }, 0)
  }
  function formatProductName(name: string): string {
    return name.replace(/([A-Z])/g, " $1").trim()
  }

  return (
    <div className='w-full grid lg:grid-cols-2 gap-10 mt-24'>
      {priceData.map((product, i) => {
        const totalCartQuantity = getTotalCartQuantityForProduct(product.name)

        return (
          <div
            className='flex flex-col w-full gap-3 rounded-lg border-[1px] border-dark-600 bg-dark-700 p-10'
            key={i}
          >
            <div className='flex w-full gap-28 justify-between items-start pb-5'>
              <div className='flex flex-col'>
                <h2 className='font-aktivGroteskBold text-white'>
                  {formatProductName(product.name)}
                </h2>
                <p className='font-aktivGroteskThin text-xs'>
                  {product.description}
                </p>
                <p className='text-sm text-gray-400'>
                  Stock Available: {product.stock}
                </p>
              </div>
              {product.name.includes("Netflix") && (
                <Image
                  src={netflixpremium}
                  alt='High Quality Netflix Premium Cheap Price | Dokmai Store'
                  width={60}
                  height={60}
                  className='w-fit select-none'
                  loading='lazy'
                />
              )}
              {product.name.includes("Prime") && (
                <Image
                  src={primevideo}
                  alt='High Quality Prime Video Cheap Price | Dokmai Store'
                  width={60}
                  height={60}
                  className='w-fit select-none'
                  loading='lazy'
                />
              )}
            </div>
            <div className='flex flex-col w-full'>
              {product.details.map((price: any, j: number) => {
                const cartQuantity = getCartItemQuantity(price.id)

                return (
                  <div
                    className='flex w-full justify-between items-center py-3 border-b-[1px] border-dark-500'
                    key={j}
                  >
                    <div className='flex w-fit gap-3'>
                      <span
                        className={`px-1 text-xl ${
                          product.name.includes("Reseller")
                            ? "bg-goldVIP"
                            : "bg-primary"
                        } text-dark-800 font-aktivGroteskBold whitespace-nowrap`}
                      >
                        {price.duration}
                      </span>
                      <p className='text-xl whitespace-nowrap'>
                        ฿ {price.price}
                      </p>
                    </div>
                    <div className='flex gap-3 items-center'>
                      {cartQuantity > 0 ? (
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() =>
                              cartQuantity > 1
                                ? updateQuantity(price.id, cartQuantity - 1)
                                : removeFromCart(price.id)
                            }
                            disabled={
                              product.name.includes("Reseller") &&
                              cartQuantity <= 2
                            } // Disable if Reseller product and quantity is 2 or less
                            className='p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-50 disabled:cursor-not-allowed active:bg-dark-600 active:border-light-100'
                          >
                            <AiOutlineMinus />
                          </button>
                          <span className='text-white'>{cartQuantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(price.id, cartQuantity + 1)
                            }
                            disabled={totalCartQuantity >= product.stock}
                            className='p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-50 disabled:cursor-not-allowed active:bg-dark-600 active:border-light-100'
                          >
                            <AiOutlinePlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const quantityToAdd =
                              product.name.includes("Reseller") &&
                              cartQuantity === 0
                                ? 2
                                : 1

                            addToCart({
                              id: price.id,
                              appName: product.name,
                              duration: price.duration,
                              price: price.price,
                              quantity: quantityToAdd,
                            })
                          }}
                          disabled={
                            product.stock === 0 ||
                            totalCartQuantity >= product.stock
                          }
                          className={`text-white font-bold text-xs border-[1px] ${
                            product.name.includes("Reseller")
                              ? "border-goldVIP active:bg-goldVIP/60 active:text-dark-800"
                              : "border-primary active:bg-primary/60 active:text-dark-800"
                          } px-2 py-1 rounded-sm ${
                            product.stock === 0 ||
                            totalCartQuantity >= product.stock
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                        >
                          {product.stock === 0 ? "Out of Stock" : "Add to cart"}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
