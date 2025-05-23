'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroSection() {
  const banners = [
    {
      image: '/images/og-dokmaistore.webp',
    },
    {
      image: '/images/og-dokmaistore.webp',
    },
    {
      image: '/images/og-dokmaistore.webp',
    },
    {
      image: '/images/og-dokmaistore.webp',
    },
    {
      image: '/images/og-dokmaistore.webp',
    },
  ];

  const [currentBanner, setCurrentBanner] = useState(2);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [containerWidth, setContainerWidth] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextBanner = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentBanner((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 600);
  }, [banners.length, isTransitioning]);

  const prevBanner = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentBanner((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 600);
  }, [banners.length, isTransitioning]);

  const goToBanner = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentBanner) return;
      setIsTransitioning(true);
      setCurrentBanner(index);
      setIsAutoScrolling(false);
      setTimeout(() => {
        setIsTransitioning(false);
        setIsAutoScrolling(true);
      }, 600);
    },
    [currentBanner, isTransitioning]
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoScrolling && !isTransitioning) {
      interval = setInterval(() => {
        nextBanner();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoScrolling, isTransitioning, nextBanner]);

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById('carousel-container');
      if (container) {
        setContainerWidth(container.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevBanner();
      } else if (e.key === 'ArrowRight') {
        nextBanner();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextBanner, prevBanner]);

  return (
    <div className="w-full bg-dark-800 text-light-100">
      <div className="relative w-full overflow-hidden py-6 md:py-12">
        <div
          id="carousel-container"
          className="relative mx-auto max-w-[1800px] px-2 sm:px-4 md:px-6">
          <div className="relative mx-auto h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] xl:h-[380px] 2xl:h-[420px]">
            <AnimatePresence>
              {banners.map((banner, index) => {
                const position = (index - currentBanner + banners.length) % banners.length;
                const normalizedPosition = position > 2 ? position - banners.length : position;

                const isCenter = normalizedPosition === 0;
                const isPrev =
                  normalizedPosition === -1 || normalizedPosition === banners.length - 1;
                const isNext = normalizedPosition === 1;

                if (Math.abs(normalizedPosition) > 1) return null;

                const centerWidthPercent = 0.75;
                const sideWidthPercent = 0.2;

                const centerWidth = containerWidth * centerWidthPercent;
                const sideWidth = containerWidth * sideWidthPercent;

                const bannerHeight =
                  window.innerWidth >= 1536
                    ? 420
                    : window.innerWidth >= 1280
                    ? 380
                    : window.innerWidth >= 1024
                    ? 320
                    : window.innerWidth >= 768
                    ? 280
                    : window.innerWidth >= 640
                    ? 220
                    : 180;

                let xPos = 0;
                if (isCenter) xPos = 0;
                if (isPrev) xPos = -(centerWidth / 2) - sideWidth / 2 - 4;
                if (isNext) xPos = centerWidth / 2 + sideWidth / 2 + 4;

                const width = isCenter ? centerWidth : sideWidth;

                return (
                  <motion.div
                    key={index}
                    className="absolute left-1/2 top-1/2 cursor-pointer"
                    initial={false}
                    animate={{
                      x: xPos,
                      y: '-50%',
                      zIndex: isCenter ? 30 : 20,
                      opacity: isCenter ? 1 : 0.25,
                      filter: isCenter
                        ? 'grayscale(0%) brightness(1)'
                        : 'grayscale(100%) brightness(0.7)',
                      scale: isCenter ? 1 : 0.95,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 180,
                      damping: 25,
                      mass: 1,
                      duration: 0.6,
                    }}
                    onClick={() => (!isCenter && !isTransitioning ? goToBanner(index) : null)}
                    whileHover={
                      !isCenter
                        ? {
                            opacity: 0.5,
                            filter: 'grayscale(70%) brightness(0.85)',
                            scale: 0.98,
                            transition: {
                              duration: 0.3,
                              ease: 'easeOut',
                            },
                          }
                        : {
                            scale: 1.02,
                            transition: {
                              duration: 0.4,
                              ease: 'easeOut',
                            },
                          }
                    }
                    style={{
                      width: width,
                      height: bannerHeight,
                      marginLeft: -width / 2,
                    }}>
                    <motion.div
                      className={`relative h-full w-full overflow-hidden shadow-2xl rounded-xl ${
                        isCenter
                          ? 'border-2 border-primary-500/30 shadow-primary-500/10'
                          : ' border border-gray-700/50 shadow-black/20'
                      }`}
                      initial={false}
                      animate={{
                        borderColor: isCenter ? 'rgba(79, 70, 229, 0.3)' : 'rgba(75, 85, 99, 0.5)',
                        boxShadow: isCenter
                          ? '0 20px 25px -5px rgba(79, 70, 229, 0.05), 0 10px 10px -5px rgba(79, 70, 229, 0.1)'
                          : '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -4px rgba(0, 0, 0, 0.2)',
                      }}
                      transition={{
                        duration: 0.5,
                        ease: 'easeInOut',
                      }}>
                      <Image
                        src={
                          banner.image || '/placeholder.svg?height=360&width=640&query=game banner'
                        }
                        alt="Ads"
                        fill
                        className="object-cover"
                        priority={isCenter}
                        draggable={false}
                        sizes={`${width}px`}
                      />

                      {isPrev && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/20"
                          initial={{ opacity: 0.2 }}
                          animate={{ opacity: 0.2 }}
                          whileHover={{ opacity: 0.4 }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isTransitioning) prevBanner();
                          }}>
                          {/* <motion.div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark-800 shadow-lg sm:h-10 sm:w-10 md:h-12 md:w-12"
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                          </motion.div> */}
                        </motion.div>
                      )}

                      {isNext && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/20"
                          initial={{ opacity: 0.2 }}
                          animate={{ opacity: 0.2 }}
                          whileHover={{ opacity: 0.4 }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isTransitioning) nextBanner();
                          }}>
                          {/* <motion.div
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-dark-800 shadow-lg sm:h-10 sm:w-10 md:h-12 md:w-12"
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                          </motion.div> */}
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center gap-3 md:mt-8">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => !isTransitioning && goToBanner(index)}
                className="h-1.5 w-6 rounded-full md:h-2 md:w-8"
                aria-label={`Go to banner ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                initial={false}
                animate={{
                  backgroundColor: currentBanner === index ? '#4f46e5' : '#374151',
                  opacity: currentBanner === index ? 1 : 0.7,
                  scale: currentBanner === index ? 1.1 : 1,
                }}
                transition={{
                  duration: 0.4,
                  ease: 'easeInOut',
                  scale: {
                    type: 'spring',
                    stiffness: 300,
                    damping: 20,
                  },
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold md:text-2xl">EXCLUSIVE OFFERS</h2>
            <p className="text-sm text-gray-400 md:text-base">
              Don't miss our limited-time offers! Discover current deals today!
            </p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-gray-800 md:px-6 md:py-3">
            View more
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Link
                href="#"
                className="block rounded-xl bg-dark-500/80 p-3 transition-all hover:bg-gray-800/80">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Image
                      src={product.image || '/placeholder.svg?height=48&width=48&query=game icon'}
                      alt={product.title}
                      width={48}
                      height={48}
                      draggable={false}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="truncate text-sm font-medium text-white">{product.title}</h3>
                    <p className="truncate text-xs text-gray-400">{product.subtitle}</p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

const products = [
  {
    id: 1,
    title: 'Monster Hunter Wilds Steam',
    subtitle: 'Monster Hunter Wilds Steam CD Key',
    image: '/placeholder-dni2k.png',
  },
  {
    id: 2,
    title: 'Steam Wallet Code 100 TWD',
    subtitle: 'Steam Wallet Code (TWD)',
    image: '/steam-logo.png',
  },
  {
    id: 3,
    title: '6480 + 1620 Delta Coins',
    subtitle: 'Delta Force Top Up Global',
    image: '/delta-force-icon-green.png',
  },
  {
    id: 4,
    title: 'Monster Hunter Wilds Steam',
    subtitle: 'Monster Hunter Wilds Steam CD Key',
    image: '/placeholder-dni2k.png',
  },
  {
    id: 5,
    title: 'iTunes Gift Card 2 EUR AT',
    subtitle: 'iTunes Gift Card (AT)',
    image: '/generic-music-note-logo.png',
  },
  {
    id: 6,
    title: '7768 Credits',
    subtitle: 'LifeAfter Credits & Packages',
    image: '/lifeafter-game-icon.png',
  },
  {
    id: 7,
    title: 'iTunes Gift Card 30 DKK DK',
    subtitle: 'iTunes Gift Card (DK)',
    image: '/generic-music-note-logo.png',
  },
  {
    id: 8,
    title: '1080 Diamonds',
    subtitle: 'Free Fire Diamonds',
    image: '/generic-battle-royale-icon.png',
  },
  {
    id: 9,
    title: 'PSN Card 50 USD OMN',
    subtitle: 'PlayStation Network Card (OM)',
    image: '/playstation-logo.png',
  },
  {
    id: 10,
    title: '5600 Diamonds',
    subtitle: 'Free Fire Diamonds (MY/SG/PH/ID)',
    image: '/generic-battle-royale-icon.png',
  },
];
