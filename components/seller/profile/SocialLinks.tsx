'use client';
import { FaFacebook } from 'react-icons/fa';
import { FaSquareInstagram } from 'react-icons/fa6';
import { BsLine } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';

import { cn } from '@/lib/utils';

interface SocialLinksProps {
  contact: {
    facebook?: string;
    instagram?: string;
    line?: string;
    whatsapp?: string;
  };
}

export function SocialLinks({ contact }: SocialLinksProps) {
  const { facebook, instagram, line, whatsapp } = contact;
  const hasContact = facebook || instagram || line || whatsapp;

  if (!hasContact) {
    return <p className="text-sm text-muted-foreground italic">No contact information available</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {facebook && (
        <SocialLink
          icon={<FaFacebook />}
          name="Facebook"
          value={facebook}
          url={`https://facebook.com/${facebook}`}
          color="text-blue-600"
        />
      )}
      {instagram && (
        <SocialLink
          icon={<FaSquareInstagram />}
          name="Instagram"
          value={instagram}
          url={`https://instagram.com/${instagram}`}
          color="text-pink-600"
        />
      )}
      {line && <SocialLink icon={<BsLine />} name="Line" value={line} color="text-green-600" />}
      {whatsapp && (
        <SocialLink
          icon={<IoLogoWhatsapp />}
          name="WhatsApp"
          value={whatsapp}
          color="text-green-500"
        />
      )}
    </div>
  );
}

interface SocialLinkProps {
  icon: React.ReactNode;
  name: string;
  value: string;
  url?: string;
  color: string;
}

function SocialLink({ icon, name, value, url, color }: SocialLinkProps) {
  // Map social media names to gradient color bases, similar to StatItem's color prop
  const gradientColors = {
    Facebook: 'blue',
    Instagram: 'pink',
    Line: 'green',
    WhatsApp: 'green',
  };

  // Define color styles for gradient and border hover effects, mirroring StatItem
  const colorStyles = {
    blue: 'hover:border-blue-400/50 hover:via-blue-400/20 via-blue-400/5',
    pink: 'hover:border-pink-400/50 hover:via-pink-400/20 via-pink-400/5',
    green: 'hover:border-green-400/50 hover:via-green-400/20 via-green-400/5',
    gray: 'hover:border-gray-400/50 hover:via-gray-400/20 via-gray-400/5',
  };

  // Determine the gradient color based on the social media name
  const gradientColor = gradientColors[name as keyof typeof gradientColors] || 'gray';

  // Define the content with styles matching StatItem
  const content = (
    <div
      className={cn(
        'rounded-md border-[0.5px] border-transparent p-2',
        'bg-gradient-to-tr from-transparent to-transparent from-5% via-55% to-100%',
        'transition-all duration-500',
        colorStyles[gradientColor as keyof typeof colorStyles]
      )}>
      <div className="flex items-center gap-2">
        <div className={cn('transition-transform duration-300 group-hover:scale-110', color)}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground">{name}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
    </div>
  );

  // If there's a URL, wrap the content in an anchor tag with group class for hover effects
  if (url) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-md transition-colors hover:no-underline group">
        {content}
      </a>
    );
  }

  // If no URL, wrap in a div with group class
  return <div className="group">{content}</div>;
}
