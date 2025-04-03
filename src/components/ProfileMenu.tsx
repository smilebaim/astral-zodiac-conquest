
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { UserIcon, LogOutIcon, User2Icon } from 'lucide-react';

const ProfileMenu = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const username = user?.user_metadata?.username || 'Commander';
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative text-cosmic-light-purple border border-cosmic-purple/40 px-4">
          <UserIcon className="h-5 w-5 mr-2" />
          <span className="truncate max-w-[100px]">{username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 cosmic-border backdrop-blur-md">
        <DropdownMenuLabel className="flex items-center gap-2">
          <User2Icon className="h-4 w-4" />
          <span>Account</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="cursor-pointer"
          onClick={handleSignOut}
        >
          <LogOutIcon className="h-4 w-4 mr-2" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button 
      onClick={() => navigate('/auth')}
      className="cosmic-button"
    >
      Sign In
    </Button>
  );
};

export default ProfileMenu;
