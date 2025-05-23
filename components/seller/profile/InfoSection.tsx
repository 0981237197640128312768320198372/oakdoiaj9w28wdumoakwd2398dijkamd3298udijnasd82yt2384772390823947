'use client';

import { cn } from '@/lib/utils';

interface InfoSectionProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function InfoSection({ title, icon, children, className }: InfoSectionProps) {
  return (
    <div
      className={cn(
        'group p-4 transition-all duration-300 rounded-2xl bg-dark-700 border-[1px] border-dark-500',
        'hover:border-primary/40 hover:shadow-sm',
        className
      )}>
      <div className="flex items-center gap-2 mb-5">
        {icon && (
          <div
            className={cn(
              'transition-colors duration-300 border-[1px] border-transparent bg-dark-600 w-fit p-2 rounded-lg',
              'group-hover:text-primary group-hover:border-primary/70'
            )}>
            {icon}
          </div>
        )}
        <h3 className="text-white tracking-widest font-aktivGroteskBlack">{title}</h3>
      </div>
      <div className="pl-2">{children}</div>
    </div>
  );
}
