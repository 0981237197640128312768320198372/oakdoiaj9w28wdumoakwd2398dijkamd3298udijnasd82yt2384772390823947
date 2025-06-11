'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeUtils } from '@/lib/theme-utils';
import { Smartphone, Monitor, Home, Package, Info, Search, User } from 'lucide-react';
import type { ThemeType } from '@/types';
import Image from 'next/image';
import dokmailogosquare from '@/assets/images/dokmailogosquare.png';

interface LivePreviewProps {
  theme: ThemeType;
  seller?: {
    store?: {
      name?: string;
      logoUrl?: string;
      description?: string;
    };
    username?: string;
  };
}

export default function LivePreview({ theme, seller }: LivePreviewProps) {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('desktop');
  const [activePage, setActivePage] = useState<'home' | 'products' | 'profile'>('home');
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  // Mock data for preview
  const mockProducts = [
    { id: 1, name: 'Product 1', price: '299', image: '' },
    { id: 2, name: 'Product 2', price: '199', image: '' },
    { id: 3, name: 'Product 3', price: '399', image: '' },
    { id: 4, name: 'Product 4', price: '499', image: '' },
  ];

  const layoutStyles = {
    background: isLight ? 'bg-light-100' : 'bg-dark-800',
    text: isLight ? 'text-dark-800' : 'text-light-100',
  };

  return (
    <div className="rounded-lg border border-dark-700 overflow-hidden">
      {/* Preview Controls */}
      <div className="bg-dark-800 border-b border-dark-700 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('mobile')}
            className={cn(
              'p-1.5 rounded-md transition-all',
              viewMode === 'mobile'
                ? 'bg-primary text-dark-800'
                : 'bg-dark-700 text-light-400 hover:text-light-100'
            )}
            aria-label="Mobile view">
            <Smartphone className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('desktop')}
            className={cn(
              'p-1.5 rounded-md transition-all',
              viewMode === 'desktop'
                ? 'bg-primary text-dark-800'
                : 'bg-dark-700 text-light-400 hover:text-light-100'
            )}
            aria-label="Desktop view">
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActivePage('home')}
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium transition-all',
              activePage === 'home'
                ? 'bg-primary text-dark-800'
                : 'bg-dark-700 text-light-400 hover:text-light-100'
            )}>
            Home
          </button>
          <button
            onClick={() => setActivePage('products')}
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium transition-all',
              activePage === 'products'
                ? 'bg-primary text-dark-800'
                : 'bg-dark-700 text-light-400 hover:text-light-100'
            )}>
            Products
          </button>
          <button
            onClick={() => setActivePage('profile')}
            className={cn(
              'px-2 py-1 rounded-md text-xs font-medium transition-all',
              activePage === 'profile'
                ? 'bg-primary text-dark-800'
                : 'bg-dark-700 text-light-400 hover:text-light-100'
            )}>
            Profile
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div
        className={cn(
          'transition-all duration-300 overflow-hidden',
          layoutStyles.background,
          viewMode === 'mobile' ? 'w-[320px] mx-auto' : 'w-full'
        )}
        style={{
          height: '400px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}>
        {/* Navbar */}
        <div
          className={cn(
            'sticky top-0 z-10 w-full p-3 flex items-center justify-between',
            themeUtils.getCardClass(),
            themeUtils.getComponentShadowClass()
          )}>
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 relative overflow-hidden',
                themeUtils.getButtonRoundednessClass()
              )}>
              <Image
                src={seller?.store?.logoUrl || dokmailogosquare}
                alt="Store logo"
                width={32}
                height={32}
                className="object-cover w-full h-full"
              />
            </div>
            <span className={cn('font-medium text-sm', layoutStyles.text)}>
              {seller?.store?.name || 'Store Name'}
            </span>
          </div>

          {viewMode === 'desktop' && (
            <div className="hidden md:flex items-center gap-1.5">
              <NavButton
                icon={<Home size={14} />}
                label="Home"
                isActive={activePage === 'home'}
                theme={theme}
              />
              <NavButton
                icon={<Package size={14} />}
                label="Products"
                isActive={activePage === 'products'}
                theme={theme}
              />
              <NavButton
                icon={<Info size={14} />}
                label="Profile"
                isActive={activePage === 'profile'}
                theme={theme}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              className={cn(
                'p-1.5 rounded-md',
                isLight ? 'bg-light-200 text-dark-600' : 'bg-dark-600 text-light-400',
                themeUtils.getButtonRoundednessClass()
              )}>
              <Search className="h-3.5 w-3.5" />
            </button>
            <button
              className={cn(
                'px-2.5 py-1.5 text-xs font-medium',
                themeUtils.getButtonClass(),
                themeUtils.getButtonRoundednessClass()
              )}>
              Login
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-16">
          {activePage === 'home' && (
            <div className="space-y-6">
              {/* Banner */}
              {theme.customizations.ads.images && theme.customizations.ads.images.length > 0 ? (
                <div
                  className={cn(
                    'w-full h-32 bg-gray-200 relative overflow-hidden',
                    themeUtils.getAdsRoundednessClass(),
                    themeUtils.getAdsShadowClass()
                  )}>
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    Banner Image
                  </div>
                </div>
              ) : (
                <div
                  className={cn(
                    'w-full h-32 bg-gray-200 flex items-center justify-center',
                    themeUtils.getAdsRoundednessClass(),
                    themeUtils.getAdsShadowClass()
                  )}>
                  <span className="text-gray-500 text-sm">Banner Image</span>
                </div>
              )}

              {/* Featured Products */}
              <div className="space-y-3">
                <h2 className={cn('font-medium', layoutStyles.text)}>Featured Products</h2>
                <div className="grid grid-cols-2 gap-3">
                  {mockProducts.slice(0, 4).map((product) => (
                    <div
                      key={product.id}
                      className={cn(
                        'p-3 flex flex-col',
                        themeUtils.getCardClass(),
                        themeUtils.getComponentRoundednessClass()
                      )}>
                      <div
                        className={cn(
                          'w-full h-20 bg-gray-300 mb-2',
                          themeUtils.getComponentRoundednessClass()
                        )}></div>
                      <h3 className={cn('text-sm font-medium', layoutStyles.text)}>
                        {product.name}
                      </h3>
                      <p className={cn('text-xs mt-1', themeUtils.getPrimaryColorClass('text'))}>
                        {product.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activePage === 'products' && (
            <div className="space-y-4">
              <h1 className={cn('text-lg font-medium', layoutStyles.text)}>All Products</h1>

              <div className="grid grid-cols-2 gap-3">
                {mockProducts.map((product) => (
                  <div
                    key={product.id}
                    className={cn(
                      'p-3 flex flex-col',
                      themeUtils.getCardClass(),
                      themeUtils.getComponentRoundednessClass()
                    )}>
                    <div
                      className={cn(
                        'w-full h-20 bg-gray-300 mb-2',
                        themeUtils.getComponentRoundednessClass()
                      )}></div>
                    <h3 className={cn('text-sm font-medium', layoutStyles.text)}>{product.name}</h3>
                    <p className={cn('text-xs mt-1', themeUtils.getPrimaryColorClass('text'))}>
                      {product.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'profile' && (
            <div className="space-y-4">
              <div
                className={cn(
                  'p-4 flex flex-col items-center',
                  themeUtils.getCardClass(),
                  themeUtils.getComponentRoundednessClass()
                )}>
                <div
                  className={cn(
                    'w-16 h-16 relative overflow-hidden mb-3',
                    themeUtils.getButtonRoundednessClass()
                  )}>
                  <Image
                    src={seller?.store?.logoUrl || dokmailogosquare}
                    alt="Store logo"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
                <h1 className={cn('text-lg font-medium', layoutStyles.text)}>
                  {seller?.store?.name || 'Store Name'}
                </h1>
                <p className={cn('text-sm mt-1', isLight ? 'text-dark-600' : 'text-light-400')}>
                  {seller?.store?.description ||
                    'Store description goes here. This is a preview of your store profile.'}
                </p>

                <button
                  className={cn(
                    'mt-4 px-3 py-1.5 text-sm font-medium',
                    themeUtils.getButtonClass(),
                    themeUtils.getButtonRoundednessClass()
                  )}>
                  Contact Store
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        {viewMode === 'mobile' && (
          <div className="fixed bottom-0 left-0 w-full p-2 flex items-center justify-around">
            <div
              className={cn(
                'w-full flex items-center justify-around p-1.5 rounded-full',
                isLight
                  ? 'bg-white/80 backdrop-blur-md shadow-sm'
                  : 'bg-dark-700/80 backdrop-blur-md shadow-md',
                'border',
                isLight ? 'border-light-300' : 'border-dark-500'
              )}>
              <MobileNavButton
                icon={<Home size={18} />}
                isActive={activePage === 'home'}
                onClick={() => setActivePage('home')}
                theme={theme}
                label="Home"
              />
              <MobileNavButton
                icon={<Package size={18} />}
                isActive={activePage === 'products'}
                onClick={() => setActivePage('products')}
                theme={theme}
                label="Products"
              />
              <MobileNavButton
                icon={<Info size={18} />}
                isActive={activePage === 'profile'}
                onClick={() => setActivePage('profile')}
                theme={theme}
                label="Profile"
              />
              <MobileNavButton
                icon={<Search size={18} />}
                isActive={false}
                onClick={() => {}}
                theme={theme}
                label="Search"
              />
              <MobileNavButton
                icon={<User size={18} />}
                isActive={false}
                onClick={() => {}}
                theme={theme}
                label="Account"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  theme: ThemeType;
}

function NavButton({ icon, label, isActive, theme }: NavButtonProps) {
  const themeUtils = useThemeUtils(theme);
  const isLight = themeUtils.baseTheme === 'light';

  return (
    <button
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all',
        isActive
          ? themeUtils.getPrimaryColorClass('bg')
          : isLight
          ? 'text-dark-600 hover:bg-light-200'
          : 'text-light-400 hover:bg-dark-600',
        themeUtils.getButtonRoundednessClass()
      )}>
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface MobileNavButtonProps {
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
  theme: ThemeType;
  label: string;
}

function MobileNavButton({ icon, isActive, onClick, theme, label }: MobileNavButtonProps) {
  const themeUtils = useThemeUtils(theme);

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center p-1.5 rounded-full',
        isActive ? themeUtils.getPrimaryColorClass('bg') : 'transparent',
        themeUtils.getTextColors()
      )}>
      {icon}
      <span className="text-[8px] mt-1">{label}</span>
    </button>
  );
}
