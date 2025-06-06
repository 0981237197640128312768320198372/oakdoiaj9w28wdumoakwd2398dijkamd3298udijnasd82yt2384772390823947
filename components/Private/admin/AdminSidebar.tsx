'use client';

import * as React from 'react';
import { Activity, BarChart3, HelpCircle, Home, LogOut, Users, Wallet } from 'lucide-react';
import { GrAppsRounded } from 'react-icons/gr';
import { TbDatabase } from 'react-icons/tb';
import { RiRobot2Line } from 'react-icons/ri';
import { RxActivityLog } from 'react-icons/rx';
import DokmaiIcon from '@/assets/images/dokmailogosquare.png';

import { MdOutlineMarkEmailUnread } from 'react-icons/md';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import Image from 'next/image';

const sectionIcons: Record<string, React.ElementType> = {
  StatisticCards: BarChart3,
  Statistics: Activity,
  AdminDeposit: Wallet,
  EmailsViewer: MdOutlineMarkEmailUnread,
  ActivityLogs: RxActivityLog,
  ManageHelps: HelpCircle,
  ManageUsers: Users,
  DataRemain: TbDatabase,
  TheBot: RiRobot2Line,
  Management: GrAppsRounded,
  CategoryManagement: GrAppsRounded,
};

const sectionTitles: Record<string, string> = {
  StatisticCards: 'Statistic Cards',
  Statistics: 'Statistics Chart',
  AdminDeposit: 'Deposit',
  EmailsViewer: 'Email',
  ActivityLogs: 'User Activity',
  ManageHelps: 'Manage Helps',
  ManageUsers: 'Manage Users',
  DataRemain: 'Data Remain',
  TheBot: 'TheBot',
  Management: 'Management',
  CategoryManagement: 'Category',
};

interface AdminSidebarProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
  onLogout: () => void;
  userName: string;
}

export function AdminSidebar({
  children,
  currentSection,
  onSectionChange,
  onLogout,
  userName,
}: AdminSidebarProps) {
  const filteredSections = React.useMemo(() => {
    const sections = Object.keys(sectionTitles);

    return sections.filter((section) => sectionTitles[section].toLowerCase());
  }, []);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-dark-800 text-white w-full">
        <Sidebar variant="floating" className="border-r border-dark-500">
          <SidebarHeader className="px-5 py-5">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md">
                <Image
                  src={DokmaiIcon}
                  alt="Dokmai Icon"
                  width={100}
                  height={100}
                  className="h-8 w-8"
                />
              </div>
              <div className="font-semibold">Dokmai Store</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filteredSections.map((section) => {
                      const Icon = sectionIcons[section] || Home;
                      return (
                        <SidebarMenuItem key={section}>
                          <SidebarMenuButton
                            isActive={currentSection === section}
                            className={`transition-all duration-300  ${
                              currentSection === section ? 'bg-primary text-black ' : ''
                            }`}
                            onClick={() => onSectionChange(section)}>
                            <Icon className="h-5 w-5" />
                            <span>{sectionTitles[section]}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </ScrollArea>
          </SidebarContent>
          <SidebarFooter className="border-t border-dark-500 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-dark-800 flex items-center justify-center text-dark-800">
                  <Image
                    src={DokmaiIcon}
                    alt="Dokmai Icon"
                    width={100}
                    height={100}
                    className="h-5 w-5"
                  />
                </div>
                <div className="flex flex-col text-sm">
                  <span className="font-medium">{userName}</span>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-md bg-red-500/30 text-red-500 hover:bg-red-500/50 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-10 flex w-full h-14 items-center gap-4 border-b border-dark-500 bg-dark-800 px-5">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6 bg-dark-500 text-white" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="#" className="text-muted-foreground">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{sectionTitles[currentSection]}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex-1 bg-dark-800">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
