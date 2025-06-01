/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ThemeType } from '@/types';
import { useThemeUtils } from '@/lib/theme-utils';

interface BannerAdsCarouselProps {
  theme: ThemeType | null;
}

interface Banner {
  image: string;
}

export default function BannerAdsCarousel({ theme }: BannerAdsCarouselProps) {
  const defaultBanner = '/bannerplaceholder';

  const themeUtils = useThemeUtils(theme);

  const banners: Banner[] =
    themeUtils.adsImages && themeUtils.adsImages.length > 0
      ? themeUtils.adsImages.map((image: any) => ({ image }))
      : [
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
          { image: '/images/og-dokmaistore.webp' },
        ];

  const [currentBanner, setCurrentBanner] = useState(0);
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

  // Auto-scroll effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAutoScrolling && !isTransitioning && banners.length > 1) {
      interval = setInterval(() => {
        nextBanner();
      }, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoScrolling, isTransitioning, nextBanner, banners.length]);

  // Container width effect
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

  // Keyboard navigation effect
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

  // Reset current banner if banners array changes
  useEffect(() => {
    if (currentBanner >= banners.length) {
      setCurrentBanner(0);
    }
  }, [banners.length, currentBanner]);

  const getBorderClass = (isCenter: boolean) => {
    if (isCenter) {
      return `border-4 ${themeUtils.getPrimaryColorClass('border')}/30`;
    }
    return 'border border-gray-700/50';
  };

  const getShadowClass = (isCenter: boolean) => {
    if (isCenter) {
      const baseShadow = themeUtils.getAdsShadowClass();
      return `${baseShadow} ${themeUtils.getPrimaryColorClass('border')}/50`;
    }
    return `${themeUtils.getAdsShadowClass()} shadow-black/30`;
  };

  if (banners.length === 0) {
    return null;
  }

  return (
    <>
      <div className="relative w-screen overflow-hidden py-6 md:py-12 -mx-[50vw] left-1/2 right-1/2">
        <div id="carousel-container" className="relative mx-auto w-full px-2 sm:px-4 md:px-6">
          <div
            className="relative w-full 
            h-[200px] sm:h-[240px] md:h-[280px] lg:h-[320px] xl:h-[420px] 2xl:h-[540px]
            aspect-[16/9]">
            <AnimatePresence>
              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
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
                    key={`banner-${index}`}
                    className="absolute left-1/2 top-1/2 cursor-pointer"
                    initial={false}
                    animate={{
                      x: xPos,
                      y: '-50%',
                      zIndex: isCenter ? 30 : 20,
                      opacity: isCenter ? 1 : 0.45,
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
                        'relative h-full w-full overflow-hidden transition-all duration-500 ease-in-out',
                        'aspect-[4/3] sm:aspect-[3/2] md:aspect-[16/10] lg:aspect-[16/9]'
                      )}>
                      <Image
                        src={banner.image || defaultBanner}
                        alt={`Banner ${index + 1}`}
                        fill
                        className={cn(
                          'object-cover object-center',
                          themeUtils.getAdsRoundednessClass(),
                          getBorderClass(isCenter),
                          getShadowClass(isCenter)
                        )}
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
                          }}
                        />
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
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="mt-6 flex justify-center gap-5 md:mt-8">
            {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
            {banners.map((_, index) => (
              <motion.button
                key={`indicator-${index}`}
                onClick={() => !isTransitioning && goToBanner(index)}
                className={cn(
                  'h-1.5 w-6 rounded-full md:h-2 md:w-8 transition-all duration-400 ease-in-out',
                  currentBanner === index
                    ? `${themeUtils.getPrimaryColorClass('bg')} opacity-100 scale-110`
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
    </>
  );
}
