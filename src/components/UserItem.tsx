import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/contexts';
import { SettingsModal } from './modals/SettingsModal';

interface UserItemProps {
  email: string;
  name?: string;
  avatarUrl?: string;
}

export function UserItem({ email, name, avatarUrl }: UserItemProps) {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              name?.charAt(0).toUpperCase()
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[360px] h-full rounded-2xl mt-2"
        >
          <div className="flex items-center gap-3 p-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="h-13 w-13 rounded-full border"
              />
            ) : (
              <div className="relative flex text-xl font-semibold h-13 w-13 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                {name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col text-xl">
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {name}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {email}
              </span>
            </div>
          </div>
          <Separator />

          <div className="py-2">
            <DropdownMenuItem className="px-0 py-4 cursor-pointer">
              <Link
                to="/profile"
                className="flex items-center gap-7 w-full mr-4 ml-7"
              >
                <User className="size-6 dark:text-zinc-200 text-zinc-700" />
                <p className="text-md font-semibold dark:text-zinc-200 text-zinc-700">
                  Manage account
                </p>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="px-0 mt-2 py-4 cursor-pointer"
            >
              <div className="flex items-center gap-7 mr-4 ml-7">
                <LogOut className="size-6 dark:text-zinc-200 text-zinc-700" />
                <p className="text-md font-semibold dark:text-zinc-200 text-zinc-700">
                  Sign out
                </p>
              </div>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      <SettingsModal />
    </>
  );
}
