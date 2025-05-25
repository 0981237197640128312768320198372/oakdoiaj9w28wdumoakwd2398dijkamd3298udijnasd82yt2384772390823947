'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ThemeType {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  roundedness: string;
  textColor: string;
  backgroundImage: string | null;
  buttonTextColor: string;
  buttonBgColor: string;
  buttonBorder: string;
  spacing: string;
  shadow: string;
  adsImages?: string[];
}

interface HeroSectionProps {
  theme: ThemeType | null;
}

export default function HeroSection({ theme }: HeroSectionProps) {
  const defaultBanner = '/placeholder.svg?height=360&width=640&query=banner';

  const banners =
    theme?.adsImages && theme.adsImages.length > 0
      ? theme.adsImages.map((image) => ({ image }))
      : [
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
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

  const primaryColor = theme?.primaryColor || 'primary';

  const getBorderClass = (isCenter: boolean) => {
    if (isCenter) {
      if (primaryColor === 'primary') {
        return 'border-2 border-primary/30';
      }
      return `border-2 border-${primaryColor}/30`;
    }
    return 'border border-gray-700/50';
  };

  const getShadowClass = (isCenter: boolean) => {
    if (isCenter) {
      if (primaryColor === 'primary') {
        return 'shadow-2xl shadow-primary/10';
      }
      return `shadow-2xl shadow-${primaryColor}/10`;
    }
    return 'shadow-2xl shadow-black/20';
  };
  console.log(theme);
  return (
    <div className="w-full">
      <div className="relative w-full overflow-hidden py-6 md:py-12">
        <div
          id="carousel-container"
          className="relative mx-auto max-w-[1800px] px-2 sm:px-4 md:px-6">
          <div
            className="relative mx-auto 
            h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] xl:h-[380px] 2xl:h-[420px]
            aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/10] lg:aspect-[16/9]">
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
                      opacity: isCenter ? 1 : 0.35,
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
                      height: '100%',
                      marginLeft: -width / 2,
                    }}>
                    <div
                      className={cn(
                        'relative h-full w-full overflow-hidden rounded-xl transition-all duration-500 ease-in-out',

                        'aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/10] lg:aspect-[16/9]',
                        getBorderClass(isCenter),
                        getShadowClass(isCenter)
                      )}>
                      <Image
                        src={banner.image || defaultBanner}
                        alt="Ads"
                        fill
                        className="object-cover"
                        priority={isCenter}
                        draggable={false}
                        sizes={`${width}px`}
                      />

                      {isPrev && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors duration-300"
                          initial={{ opacity: 0.2 }}
                          animate={{ opacity: 0.2 }}
                          whileHover={{ opacity: 0.4 }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isTransitioning) prevBanner();
                          }}></motion.div>
                      )}

                      {isNext && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-colors duration-300"
                          initial={{ opacity: 0.2 }}
                          animate={{ opacity: 0.2 }}
                          whileHover={{ opacity: 0.4 }}
                          transition={{ duration: 0.3 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isTransitioning) nextBanner();
                          }}></motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center gap-5 md:mt-8">
            {banners.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => !isTransitioning && goToBanner(index)}
                className={cn(
                  'h-1.5 w-6 rounded-full md:h-2 md:w-8 transition-all duration-400 ease-in-out',
                  currentBanner === index
                    ? `bg-${primaryColor} opacity-100 scale-110`
                    : 'bg-gray-600 opacity-70 scale-100 hover:opacity-90'
                )}
                aria-label={`Go to banner ${index + 1}`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
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
            <h2 className="text-xl font-bold text-light-100 md:text-2xl">EXCLUSIVE OFFERS</h2>
            <p className="text-sm text-gray-400 md:text-base">
              Don't miss our limited-time offers! Discover current deals today!
            </p>
          </div>
          <Link
            href="#"
            className="flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-all duration-300 hover:bg-gray-800 hover:scale-105 md:px-6 md:py-3">
            View more
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {categories.map((product, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Link
                href="#"
                className="block rounded-xl bg-dark-500/80 p-3 transition-all duration-300 hover:bg-gray-800/80 hover:shadow-lg">
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

const categories = [
  {
    title: 'Spotify',
    subtitle: 'Spotify Premium | Thai Account',
    image: '/images/og-dokmaistore.webp',
  },
];
