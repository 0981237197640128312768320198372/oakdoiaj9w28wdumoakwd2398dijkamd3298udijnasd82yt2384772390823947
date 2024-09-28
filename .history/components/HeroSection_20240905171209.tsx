"use client"

import React from "react"
import Image from "next/image"

const HeroSection = () => {
    return (
        <div className='flex flex-col-reverse lg:flex-row justify-between w-full h-[650px] mb-5 rounded-2xl bg-light-200 dark:bg-dark-500 overflow-hidden p-10 shadow-lg max-w-[1800px] border-[1px] border-primary dark:border-none'>
            <div className='flex items-end'>
                <div className='flex flex-col lg:max-w-[700px] h-fit gap-5'>
                    <div className='flex flex-col'>
                        <span className='font-mono text-xs tracking-widest'>
                            Thailand Netflix Suppliar
                        </span>
                        <div className='flex items-start text-primary text-5xl md:text-6xl lg:text-7xl h-full'>
                            WATCH SERIES NOW!
                        </div>
                    </div>
                    <div className='flex flex-col justify-start gap-2'>
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
            <div className='flex items-end md:items-start h-full md:-mr-36 lg:-mt-52 -mt-72 -mr-20'>
                <Image
                    src="/assets/images/wsnoutline.png"
                    alt='wsn'
                    width={800}
                    height={800}
                    className=''
                />
            </div>
        </div>
    )
}

export default HeroSection
