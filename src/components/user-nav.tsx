
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';
import { useSidebar } from './ui/sidebar';

type UserProfile = {
  first_name: string;
  last_name: string;
  email: string;
};

export function UserNav() {
  const router = useRouter();
  const { state: sidebarState, isMobile } = useSidebar();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);
  
  const isCollapsed = sidebarState === 'collapsed' && !isMobile;
  const userName = user ? `${user.first_name} ${user.last_name}` : 'Loading...';
  const userEmail = user ? user.email : '';
  const userInitials = user ? `${user.first_name?.charAt(0) ?? ''}${user.last_name?.charAt(0) ?? ''}`.toUpperCase() : '';

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (isLoading && !isCollapsed) {
    return (
        <div className="flex items-center gap-2 p-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
            </div>
        </div>
    );
  }

  if (!user && !isCollapsed) {
     return (
      <div className="p-2">
          <Button variant="outline" onClick={() => router.push('/login')} className='w-full'>Login</Button>
      </div>
     )
  }

  if (isCollapsed) {
    return (
      <div className="flex w-full justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-transparent focus-visible:ring-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className='bg-muted text-foreground'>{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{userName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <Link href="/profile"><DropdownMenuItem>Profile</DropdownMenuItem></Link>
                <Link href="/policies"><DropdownMenuItem>Policies</DropdownMenuItem></Link>
                <Link href="/chatbot"><DropdownMenuItem>Chatbot</DropdownMenuItem></Link>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              {isClient && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Log out</DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader><AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle><AlertDialogDescription>You will be returned to the login page.</AlertDialogDescription></AlertDialogHeader>
                      <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction></AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between w-full p-2">
       <div className='flex items-center gap-2 overflow-hidden'>
        <Avatar className="h-8 w-8">
            <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-0.5 overflow-hidden">
            <p className="text-sm font-medium leading-none text-sidebar-foreground truncate">{userName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{userEmail}</p>
        </div>
       </div>
       {isClient && (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-sidebar-foreground flex-shrink-0">
                        <LogOut className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle><AlertDialogDescription>You will be returned to the login page.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleLogout}>Log Out</AlertDialogAction></AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
       )}
    </div>
  );
}
