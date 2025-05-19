/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// components/seller/profile/ThemeCustomizer.tsx
'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';

interface ThemeCustomizerProps {
  seller: any; // Adjust type as needed
  onThemeChange: (theme: any) => void; // Adjust type as needed
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ seller, onThemeChange }) => {
  const [roundedness, setRoundedness] = useState(seller?.store?.theme?.roundedness || 'rounded');
  const [primaryColor, setPrimaryColor] = useState(seller?.store?.theme?.primaryColor || '#B9FE13');
  const [secondaryColor, setSecondaryColor] = useState(
    seller?.store?.theme?.secondaryColor || '#0F0F0F'
  );
  const [textColor, setTextColor] = useState(seller?.store?.theme?.textColor || '#ECECEC');
  const [fontFamily, setFontFamily] = useState(
    seller?.store?.theme?.fontFamily || 'AktivGrotesk-Regular'
  );
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(
    seller?.store?.theme?.backgroundImage || null
  );
  const [buttonTextColor, setButtonTextColor] = useState(
    seller?.store?.theme?.buttonTextColor || '#0F0F0F'
  );
  const [buttonBgColor, setButtonBgColor] = useState(
    seller?.store?.theme?.buttonBgColor || '#B9FE13'
  );
  const [buttonBorder, setButtonBorder] = useState(
    seller?.store?.theme?.buttonBorder || 'border-none'
  );
  const [spacing, setSpacing] = useState(seller?.store?.theme?.spacing || 'normal');
  const [shadow, setShadow] = useState(seller?.store?.theme?.shadow || 'shadow-none');
  const [adsImage, setAdsImage] = useState<File | null>(null);
  const [adsImageUrl, setAdsImageUrl] = useState(seller?.store?.adsImageUrl || null);

  useEffect(() => {
    // Load initial values from props
    setRoundedness(seller?.store?.theme?.roundedness || 'rounded');
    setPrimaryColor(seller?.store?.theme?.primaryColor || '#B9FE13');
    setSecondaryColor(seller?.store?.theme?.secondaryColor || '#0F0F0F');
    setTextColor(seller?.store?.theme?.textColor || '#ECECEC');
    setFontFamily(seller?.store?.theme?.fontFamily || 'AktivGrotesk-Regular');
    setBackgroundImageUrl(seller?.store?.theme?.backgroundImage || null);
    setButtonTextColor(seller?.store?.theme?.buttonTextColor || '#0F0F0F');
    setButtonBgColor(seller?.store?.theme?.buttonBgColor || '#B9FE13');
    setButtonBorder(seller?.store?.theme?.buttonBorder || 'border-none');
    setSpacing(seller?.store?.theme?.spacing || 'normal');
    setShadow(seller?.store?.theme?.shadow || 'shadow-none');
    setAdsImageUrl(seller?.store?.adsImageUrl || null);
  }, [seller]);

  const handleRoundednessChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoundedness(e.target.value as 'rounded' | 'rounded-full' | 'square');
  };

  const handlePrimaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrimaryColor(e.target.value);
  };

  const handleSecondaryColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecondaryColor(e.target.value);
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextColor(e.target.value);
  };

  const handleFontFamilyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFontFamily(e.target.value);
  };

  const handleBackgroundImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      // Implement image upload logic here and update backgroundImageUrl
      // Example:
      // const url = await uploadImage(file);
      // setBackgroundImageUrl(url);
    }
  };

  const handleButtonTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setButtonTextColor(e.target.value);
  };

  const handleButtonBgColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setButtonBgColor(e.target.value);
  };

  const handleButtonBorderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setButtonBorder(e.target.value);
  };

  const handleSpacingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSpacing(e.target.value);
  };

  const handleShadowChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setShadow(e.target.value);
  };

  const handleAdsImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAdsImage(file);
      // You'll need to implement image upload logic here
      // and update adsImageUrl with the uploaded image URL
    }
  };

  const handleSaveTheme = () => {
    const theme = {
      roundedness,
      primaryColor,
      secondaryColor,
      textColor,
      fontFamily,
      backgroundImage: backgroundImageUrl,
      buttonTextColor,
      buttonBgColor,
      buttonBorder,
      spacing,
      shadow,
      adsImageUrl,
    };
    onThemeChange(theme);
  };

  const fontOptions = [
    'AktivGrotesk-Regular',
    'AktivGrotesk-Bold',
    'AktivGrotesk-Medium',
    // Add more fonts as needed
  ];

  const spacingOptions = ['normal', 'tight', 'wide'];
  const shadowOptions = ['shadow-none', 'shadow-sm', 'shadow-md', 'shadow-lg'];
  const borderOptions = ['border-none', 'border', 'border-2'];

  return (
    <div className="space-y-4">
      {/* Roundedness */}
      <div>
        <label className="block text-sm font-medium text-light-300">Roundedness</label>
        <select
          value={roundedness}
          onChange={handleRoundednessChange}
          className="w-full p-2 border border-dark-500 rounded bg-dark-700 text-light-200">
          <option value="rounded">Rounded</option>
          <option value="rounded-full">Rounded Full</option>
          <option value="square">Square</option>
        </select>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-sm font-medium text-light-300">Primary Color</label>
        <input
          type="color"
          value={primaryColor}
          onChange={handlePrimaryColorChange}
          className="w-full h-10 rounded bg-dark-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light-300">Secondary Color</label>
        <input
          type="color"
          value={secondaryColor}
          onChange={handleSecondaryColorChange}
          className="w-full h-10 rounded bg-dark-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light-300">Text Color</label>
        <input
          type="color"
          value={textColor}
          onChange={handleTextColorChange}
          className="w-full h-10 rounded bg-dark-700"
        />
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-sm font-medium text-light-300">Font Family</label>
        <select
          value={fontFamily}
          onChange={handleFontFamilyChange}
          className="w-full p-2 border border-dark-500 rounded bg-dark-700 text-light-200">
          {fontOptions.map((font) => (
            <option key={font} value={font}>
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-light-300">Background Image</label>
        <input type="file" accept="image/*" onChange={handleBackgroundImageChange} />
        {backgroundImageUrl && (
          <Image src={backgroundImageUrl} alt="Background Preview" className="mt-2 max-h-32" />
        )}
      </div>

      {/* Button Styles */}
      <div>
        <label className="block text-sm font-medium text-light-300">Button Text Color</label>
        <input
          type="color"
          value={buttonTextColor}
          onChange={handleButtonTextColorChange}
          className="w-full h-10 rounded bg-dark-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light-300">Button Background Color</label>
        <input
          type="color"
          value={buttonBgColor}
          onChange={handleButtonBgColorChange}
          className="w-full h-10 rounded bg-dark-700"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-light-300">Button Border</label>
        <select
          value={buttonBorder}
          onChange={handleButtonBorderChange}
          className="w-full p-2 border border-dark-500 rounded bg-dark-700 text-light-200">
          {borderOptions.map((border) => (
            <option key={border} value={border}>
              {border}
            </option>
          ))}
        </select>
      </div>

      {/* Spacing and Shadow */}
      <div>
        <label className="block text-sm font-medium text-light-300">Spacing</label>
        <select
          value={spacing}
          onChange={handleSpacingChange}
          className="w-full p-2 border border-dark-500 rounded bg-dark-700 text-light-200">
          {spacingOptions.map((spacing) => (
            <option key={spacing} value={spacing}>
              {spacing}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-light-300">Shadow</label>
        <select
          value={shadow}
          onChange={handleShadowChange}
          className="w-full p-2 border border-dark-500 rounded bg-dark-700 text-light-200">
          {shadowOptions.map((shadow) => (
            <option key={shadow} value={shadow}>
              {shadow}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-light-300">Ads Image</label>
        <input type="file" accept="image/*" onChange={handleAdsImageChange} />
        {adsImageUrl && <Image src={adsImageUrl} alt="Ads Preview" className="mt-2 max-h-32" />}
      </div>

      <button onClick={handleSaveTheme} className="bg-primary text-dark-800 py-2 px-4 rounded">
        Save Theme
      </button>
    </div>
  );
};

export default ThemeCustomizer;
