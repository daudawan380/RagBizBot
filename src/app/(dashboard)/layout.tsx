"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, FileText, Bot, Settings, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/policies", icon: FileText, label: "Company Policies" },
  { href: "/chatbot", icon: Bot, label: "Chatbot Integration" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarHeader className="justify-between">
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
            <Logo className="size-7 shrink-0 text-primary" />
            <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">
              RagBizBot
            </span>
          </div>
          <SidebarTrigger className="hidden md:flex" />
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu className="gap-2">
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={{ children: item.label, side: "right" }}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 group-data-[collapsible=icon]:p-0">
            <UserNav />
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 sticky top-0 z-30">
            <MobileNav />
            <div className="flex-1">
                {/* Can add breadcrumbs or page title here */}
            </div>
            <div className="hidden md:block">
                {/* Desktop header content */}
            </div>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-muted/40">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MobileNav() {
    const { toggleSidebar, isMobile } = useSidebar();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
      return (
        <div className="md:hidden h-6 w-6" />
      );
    }

    if (!isMobile) {
        return null;
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle navigation"
        >
            <PanelLeft className="h-6 w-6" />
        </Button>
    )
}
