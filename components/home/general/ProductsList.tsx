/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import netflixpremium from '@/assets/images/netflixpremiumuhd.png';
import primevideo from '@/assets/images/amazonprimevideo.png';
import { AiOutlineMinus, AiOutlinePlus } from 'react-icons/ai';
import dokmaicoin3d from '@/assets/images/dokmaicoin3d.png';

export const ProductsList = ({ priceData }: { priceData: any[] }) => {
  const { addToCart, updateQuantity, getCartItemQuantity, removeFromCart } = useCart();

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
        );
      }, 0);
  };
  function formatProductName(name: string): string {
    return name.replace(/([A-Z])/g, ' $1').trim();
  }

  return (
    <div className="w-full grid lg:grid-cols-2 gap-10 mt-8">
      {priceData.map((product, i) => {
        const totalCartQuantity = getTotalCartQuantityForProduct(product.name);

        return (
          <div
            className="flex flex-col w-full gap-3 rounded-lg border-[1px] border-dark-600 bg-dark-700 p-5"
            key={i}>
            <div className="flex w-full gap-28 justify-between items-start pb-5">
              <div className="flex flex-col">
                <h2 className="font-aktivGroteskBold text-white text-xs">
                  {formatProductName(product.name)}
                </h2>
                <p className="">{product.description}</p>
                <p className="font-aktivGroteskThin text-[11px] text-light-800">
                  พร้อมส่ง: {product.stock}
                </p>
              </div>
              {product.name.includes('Netflix') && (
                <Image
                  src={netflixpremium}
                  alt="High Quality Netflix Premium Cheap Price | Dokmai Store"
                  width={60}
                  height={60}
                  className="w-fit select-none"
                  loading="lazy"
                />
              )}
              {product.name.includes('Prime') && (
                <Image
                  src={primevideo}
                  alt="High Quality Prime Video Cheap Price | Dokmai Store"
                  width={60}
                  height={60}
                  className="w-fit select-none"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex flex-col w-full">
              {product.details.map((price: any, j: number) => {
                const cartQuantity = getCartItemQuantity(price.id);
                return (
                  <div
                    className="flex w-full justify-between items-center py-3 border-b-[1px] border-dark-500"
                    key={j}>
                    <div className="flex w-fit gap-1 items-center">
                      <span
                        className={`px-1 text-xl mr-3 ${
                          product.name.includes('Reseller') ? 'bg-goldVIP' : 'bg-primary'
                        } text-dark-800 font-aktivGroteskBold whitespace-nowrap`}>
                        {price.duration}
                      </span>
                      <Image
                        src={dokmaicoin3d}
                        width={70}
                        height={70}
                        alt="Dokmai Coin"
                        className="w-8 h-8"
                      />
                      <p className="text-xl whitespace-nowrap flex">{price.price}</p>
                    </div>
                    <div className="flex gap-3 items-center">
                      {cartQuantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              cartQuantity > 1
                                ? updateQuantity(price.id, cartQuantity - 1)
                                : removeFromCart(price.id)
                            }
                            disabled={cartQuantity <= 0}
                            className="p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-50 disabled:cursor-not-allowed active:bg-dark-600 active:border-light-100">
                            <AiOutlineMinus />
                          </button>
                          <span className="text-white">{cartQuantity}</span>
                          <button
                            onClick={() => updateQuantity(price.id, cartQuantity + 1)}
                            disabled={totalCartQuantity >= product.stock}
                            className="p-1 text-xs text-light-400 rounded-full border-[1px] border-light-400 disabled:opacity-50 disabled:cursor-not-allowed active:bg-dark-600 active:border-light-100">
                            <AiOutlinePlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const quantityToAdd = 1;
                            addToCart({
                              id: price.id,
                              appName: product.name,
                              duration: price.duration,
                              price: price.price,
                              quantity: quantityToAdd,
                            });
                          }}
                          disabled={product.stock === 0 || totalCartQuantity >= product.stock}
                          className={`text-white font-bold text-xs border-[1px] ${
                            product.name.includes('Reseller')
                              ? 'border-goldVIP active:bg-goldVIP/60 active:text-dark-800'
                              : 'border-primary active:bg-primary/60 active:text-dark-800'
                          } px-2 py-1 rounded-sm ${
                            product.stock === 0 || totalCartQuantity >= product.stock
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}>
                          {product.stock === 0 ? 'ไม่มีในสต็อก' : 'เพิ่มลงตะกร้า'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
