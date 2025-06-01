/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useSellerAuth } from '@/context/SellerAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Globe, Info, Mail, MessageCircle, User } from 'lucide-react';
import { StoreHeader } from './StoreHeader';
import { cn } from '@/lib/utils';
import { SocialLinks } from './SocialLinks';
import { InfoSection } from './InfoSection';
import { StoreStats } from './StoreStats';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

export default function SellerInfo() {
  const { seller } = useSellerAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!seller) {
    return (
      <Card className="w-full max-w-screen-lg opacity-0 transition-opacity duration-500 ">
        <CardContent className="text-center p-6">
          <p className="text-muted-foreground">You are not logged in as a seller</p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: th });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div
      className={cn(
        'w-full max-w-screen-lg transition-all duration-500 transform ',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      )}>
      <Card className="overflow-hidden bg-card text-card-foreground shadow-lg">
        <StoreHeader seller={seller} />
        <CardContent className="p-5 lg:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-5">
              <InfoSection title="ข้อมูลร้านค้า" icon={<Info className="h-5 w-5" />}>
                <p className="text-sm leading-relaxed p-3 bg-dark-700 rounded-xl">
                  {seller.store.description || 'No description available'}
                </p>
              </InfoSection>
              <InfoSection title="Seller Details" icon={<User className="h-5 w-5" />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href={`https://${seller.username}.dokmai.store`}
                    className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-xs">
                      https://{seller.username}.dokmai.store
                    </span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-xs">{seller.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">เป็นสมาชิกตั้งแต่</span>
                    <span className="font-medium text-xs">{formatDate(seller.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">อัพเดทล่าสุด</span>
                    <span className="font-medium text-xs">{formatDate(seller.updatedAt)}</span>
                  </div>
                </div>
              </InfoSection>
            </div>

            <div className="space-y-6">
              <StoreStats seller={seller} />
              <InfoSection title="Contact Information" icon={<MessageCircle className="h-5 w-5" />}>
                <SocialLinks contact={seller.contact} />
              </InfoSection>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
