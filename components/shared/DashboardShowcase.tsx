'use client';

import React from 'react';
import Image from 'next/image';

interface DashboardShowcaseProps {
  className?: string;
  imageUrl?: string;
  title?: string;
  subtitle?: string;
}

export default function DashboardShowcase({
  className = '',
  imageUrl,
  title = 'Sell Freely, Buy Easily',
  subtitle = 'Dokmai Store makes it simple for everyone.',
}: DashboardShowcaseProps) {
  const placeholderSvg = `data:image/svg+xml;base64,${btoa(`
    <svg width="1200" height="675" viewBox="0 0 1200 675" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="675" fill="url(#paint0_linear_0_1)"/>
      <rect x="40" y="40" width="1120" height="595" rx="12" fill="url(#paint1_linear_0_1)" fill-opacity="0.1" stroke="url(#paint2_linear_0_1)" stroke-opacity="0.2"/>
      
      <!-- Sidebar -->
      <rect x="60" y="60" width="240" height="555" rx="8" fill="url(#paint3_linear_0_1)" fill-opacity="0.05"/>
      <rect x="80" y="80" width="200" height="40" rx="4" fill="url(#paint4_linear_0_1)" fill-opacity="0.1"/>
      <rect x="80" y="140" width="200" height="32" rx="4" fill="url(#paint5_linear_0_1)" fill-opacity="0.08"/>
      <rect x="80" y="190" width="200" height="32" rx="4" fill="url(#paint6_linear_0_1)" fill-opacity="0.08"/>
      <rect x="80" y="240" width="200" height="32" rx="4" fill="url(#paint7_linear_0_1)" fill-opacity="0.08"/>
      
      <!-- Main Content -->
      <rect x="320" y="60" width="800" height="555" rx="8" fill="url(#paint8_linear_0_1)" fill-opacity="0.03"/>
      
      <!-- Cards -->
      <rect x="350" y="90" width="360" height="160" rx="8" fill="url(#paint9_linear_0_1)" fill-opacity="0.1"/>
      <rect x="730" y="90" width="360" height="160" rx="8" fill="url(#paint10_linear_0_1)" fill-opacity="0.1"/>
      <rect x="350" y="270" width="360" height="160" rx="8" fill="url(#paint11_linear_0_1)" fill-opacity="0.1"/>
      <rect x="730" y="270" width="360" height="160" rx="8" fill="url(#paint12_linear_0_1)" fill-opacity="0.1"/>
      
      <!-- Bottom Table -->
      <rect x="350" y="450" width="740" height="135" rx="8" fill="url(#paint13_linear_0_1)" fill-opacity="0.08"/>
      
      <!-- Text Elements -->
      <rect x="370" y="110" width="120" height="16" rx="2" fill="#60A5FA" fill-opacity="0.6"/>
      <rect x="370" y="135" width="80" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.4"/>
      <rect x="370" y="155" width="100" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.3"/>
      
      <rect x="750" y="110" width="120" height="16" rx="2" fill="#34D399" fill-opacity="0.6"/>
      <rect x="750" y="135" width="80" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.4"/>
      <rect x="750" y="155" width="100" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.3"/>
      
      <rect x="370" y="290" width="120" height="16" rx="2" fill="#F87171" fill-opacity="0.6"/>
      <rect x="370" y="315" width="80" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.4"/>
      <rect x="370" y="335" width="100" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.3"/>
      
      <rect x="750" y="290" width="120" height="16" rx="2" fill="#A78BFA" fill-opacity="0.6"/>
      <rect x="750" y="315" width="80" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.4"/>
      <rect x="750" y="335" width="100" height="12" rx="2" fill="#FFFFFF" fill-opacity="0.3"/>
      
      <defs>
        <linearGradient id="paint0_linear_0_1" x1="0" y1="0" x2="1200" y2="675" gradientUnits="userSpaceOnUse">
          <stop stop-color="#0F172A"/>
          <stop offset="0.5" stop-color="#1E40AF"/>
          <stop offset="1" stop-color="#312E81"/>
        </linearGradient>
        <linearGradient id="paint1_linear_0_1" x1="40" y1="40" x2="1160" y2="635" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint2_linear_0_1" x1="40" y1="40" x2="1160" y2="635" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint3_linear_0_1" x1="0" y1="0" x2="240" y2="555" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint4_linear_0_1" x1="20" y1="20" x2="220" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="#3B82F6"/>
          <stop offset="1" stop-color="#6366F1"/>
        </linearGradient>
        <linearGradient id="paint5_linear_0_1" x1="20" y1="80" x2="220" y2="112" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint6_linear_0_1" x1="20" y1="130" x2="220" y2="162" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint7_linear_0_1" x1="20" y1="180" x2="220" y2="212" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint8_linear_0_1" x1="0" y1="0" x2="800" y2="555" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint9_linear_0_1" x1="30" y1="30" x2="390" y2="190" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint10_linear_0_1" x1="410" y1="30" x2="770" y2="190" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint11_linear_0_1" x1="30" y1="210" x2="390" y2="370" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint12_linear_0_1" x1="410" y1="210" x2="770" y2="370" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="paint13_linear_0_1" x1="30" y1="390" x2="770" y2="525" gradientUnits="userSpaceOnUse">
          <stop stop-color="#FFFFFF"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
      </defs>
    </svg>
  `)}`;

  const displayImageUrl = imageUrl || placeholderSvg;

  return (
    <div className={`min-h-[75vh] w-full relative overflow-hidden ${className}`}>
      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center pt-20 justify-center px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12 max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
            <button className="group relative px-6 py-3 bg-primary/50 hover:bg-dark-600 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl  overflow-hidden">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Free Trial
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </span>
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>

            <button className="px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white text-xs sm:text-sm font-medium rounded-lg transition-all duration-300 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50">
              Request a Demo
            </button>
          </div>
        </div>

        {/* Dashboard Showcase Card */}
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Outer glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-light-100/20 to-primary/5 rounded-xl blur-xl"></div>

          {/* Main frosted glass card - tighter padding */}
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 sm:p-3 shadow-2xl">
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 animate-shimmer rounded-xl"></div>

            {/* Dashboard Image - natural aspect ratio without cropping */}
            <div className="relative w-full rounded-lg overflow-hidden border border-white/10 shadow-inner bg-white/5 backdrop-blur-sm">
              <Image
                src={displayImageUrl}
                alt="Dashboard Screenshot"
                width={1200}
                height={675}
                className="w-full h-auto object-contain"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 80vw"
              />

              {/* Overlay gradient for better visual depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>

              {/* Floating elements for extra visual appeal - adjusted positioning */}
              <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-primary/50"></div>
              <div className="absolute bottom-2 left-2 w-1.5 h-1.5 bg-primary rounded-full animate-ping shadow-lg shadow-blue-400/50"></div>
            </div>

            {/* Bottom accent line - adjusted for tighter card */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/4 h-1 bg-gradient-to-r from-transparent via-primary to-transparent"></div>
          </div>

          {/* Additional floating elements - adjusted for smaller card */}
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-primary/20 rounded-full blur-sm animate-pulse"></div>
          <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary/20 rounded-full blur-sm animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
