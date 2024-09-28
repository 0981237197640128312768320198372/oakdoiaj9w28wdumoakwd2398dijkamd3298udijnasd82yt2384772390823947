"use client"

import React from "react"
import Image from "next/image"
import wsnoutline from "@/assets/images/wsnoutline.png"

const HeroSection = () => {
    return (
        <div className="w-full flex flex-col lg:flex-row">
            <div className='flex items-end md:items-start h-full'>
                <Image
                    src={wsnoutline}
                    alt='wsn'
                    width={800}
                    height={800}
                    className=''
                />
            </div>
         <div className='flex flex-col lg:max-w-[700px] h-fit gap-5'>
                    
                    <div className='flex flex-col justify-start gap-2'><span className='font-mono text-xs tracking-widest'>
                            Thailand Netflix Suppliar
                        </span>
                        <span className='font-mono opacity-65'>
                            Supplier Netflix Premium terbesar yang memasarkan
                            ribuan akun dengan layanan berkualitas, harga
                            terjangkau, dan pengalaman streaming terbaik.
                        </span>
                        <button
                            className='flex !px-3 !py-2 !border-none !bg-primary text-white w-fit'
                            onClick={() => {
                                window.location.href = "/products"
                            }}
                        >
                            <span className='flex flex-col text-start'>
                                Beli Sekarang
                            </span>
                        </button>
                    </div>
                </div>
            
            </div>
    )
}

export default HeroSection
